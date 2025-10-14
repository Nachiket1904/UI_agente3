# utils/rag_utils.py
import os
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings, ChatNVIDIA
from langchain_community.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain

os.environ['NVIDIA_API_KEY'] = "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"

def create_vectorstore(pdf_paths, save_path):
    """Create FAISS vector store from PDFs."""
    docs = []
    for pdf_path in pdf_paths:
        loader = PyPDFLoader(pdf_path)
        docs.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    split_docs = splitter.split_documents(docs)

    embeddings = NVIDIAEmbeddings()
    vectorstore = FAISS.from_documents(split_docs, embeddings)
    os.makedirs(save_path, exist_ok=True)
    vectorstore.save_local(save_path)

def load_vectorstore(path):
    """Load a saved FAISS vector store."""
    embeddings = NVIDIAEmbeddings()
    return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)

def create_rag_chain(system_prompt, vectorstore_path):
    """Return LLM and retrieval chain for a bot."""
    llm = ChatNVIDIA(model="meta/llama-3.3-70b-instruct")

    prompt = ChatPromptTemplate.from_template(f"""
    {system_prompt}

    Use the following context to answer accurately.
    <context>
    {{context}}
    </context>
    Question: {{input}}
    """)

    vectorstore = load_vectorstore(vectorstore_path)
    retriever = vectorstore.as_retriever()
    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    return llm, retrieval_chain
