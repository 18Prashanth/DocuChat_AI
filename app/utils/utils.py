from langchain.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
class chat:
    def get_loader(self, file_path: str, extension: str):
        """Return the appropriate LangChain loader for the file type"""
        if extension == ".pdf":
            return PyPDFLoader(file_path)
        elif extension == ".docx":
            return Docx2txtLoader(file_path)
        elif extension == ".txt":
            return TextLoader(file_path, encoding='utf-8')
        else:
            raise ValueError("Unsupported file type.")