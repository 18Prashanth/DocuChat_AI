# 📘 DocuChat AI

DocuChat AI is an intelligent document-based Q&A assistant that allows users to upload documents (PDF, DOCX, TXT) and ask questions. It uses advanced Retrieval-Augmented Generation (RAG) with embeddings, a vector store, and a powerful LLM to deliver precise answers from the uploaded content.

## 🚀 Features

- 📁 Upload PDFs, DOCX, or TXT files
- 🤖 Embedding generation and storage in FAISS
- 💬 Chat-based interface with document understanding
- 🧠 Per-user memory using LangChain
- 📡 Backend powered by FastAPI

## 🛠️ Technologies

- Python, FastAPI
- LangChain
- FAISS Vector Store
- Hugging Face Embeddings / Gemini
- HTML/CSS/JavaScript frontend

## 🧪 Setup Instructions

```
git clone https://github.com/18Prashanth/DocuChat_AI.git
cd DocuChat_AI
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Start the FastAPI server:

```
uvicorn app.main:app --reload
```

### Visit in your browser.

```
http://localhost:8000
```

### 📂 Project Structure

```
DocuChat_AI/
│
├── app/
│   ├── main.py
│   ├── routes/
│   ├── schemas/
│   ├── utils/
│   └── ...
├── static/
├── templates/
├── README.md
└── requirements.txt
```

## 📷 UI Preview

## ![App Screenshot](/img1.png)

## ![App Screenshot](/img2.png)

## 💡 Author

Prashanth Gowda A S

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/prashanthgowdaas/)
