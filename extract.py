import PyPDF2

with open('milestone_1.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ""
    for i in range(len(reader.pages)):
        text += reader.pages[i].extract_text() + "\n"

with open('milestone_1.txt', 'w', encoding='utf-8') as f:
    f.write(text)
