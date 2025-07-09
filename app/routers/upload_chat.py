from fastapi import APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from langchain_google_genai.chat_models import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.vectorstores import FAISS
import os
import shutil
import uuid
from pathlib import Path
from ..utils.utils import chat
from ..schema import schema

router = APIRouter()

load_dotenv()

api_key = os.environ["GOOGLE_API_KEY"]
if api_key is None:
    raise ValueError("GEMINI_API_KEY is not set in environment or .env file")

llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash-preview-05-20", temperature = 0.7)

chat_load = chat()

VECTOR_DB_DIR = "vectorstores"

CURRENT_SESSION_ID = None
user_sessions = {}

if not os.path.exists(VECTOR_DB_DIR):
    os.makedirs(VECTOR_DB_DIR, exist_ok=True)


@router.post("/upload")
def upload_doc(file: UploadFile = File(...)):
    global CURRENT_SESSION_ID
    ext = Path(file.filename).suffix.lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are allowed.")
    
    session_id = str(uuid.uuid4())
    CURRENT_SESSION_ID = session_id


    temp_path = f"{session_id}{ext}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Load document based on type
        loader = chat_load.get_loader(temp_path, ext)
        documents = loader.load()

        # Split text into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=150)
        chunks = splitter.split_documents(documents)

        # Generate embeddings and save to FAISS
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vectorstore = FAISS.from_documents(chunks, embeddings)

        vector_path = os.path.join(VECTOR_DB_DIR, session_id)
        vectorstore.save_local(vector_path)

        # Save vectorstore path + memory for this session
        user_sessions[session_id] = {
            "vector_path": vector_path,
            "memory": ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        }

        # Cleanup
        os.remove(temp_path)

        return {"message": "Upload successful. You can now ask questions.",
                "session_id": session_id}

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")
    

@router.post("/chat")
def chat_with_document(request: schema.ChatInput ):

    global CURRENT_SESSION_ID

    if CURRENT_SESSION_ID is None or CURRENT_SESSION_ID not in user_sessions:
        raise HTTPException(status_code=400, detail="Please upload a document first.")

    session = user_sessions[CURRENT_SESSION_ID]
    
    try:
        vectorstore = FAISS.load_local(
            session["vector_path"],
            GoogleGenerativeAIEmbeddings(model="models/embedding-001"),
            allow_dangerous_deserialization=True
        )

        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 6}),
            memory=session["memory"]
        )
        result = chain.run(request.question)
        return {"answer": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
