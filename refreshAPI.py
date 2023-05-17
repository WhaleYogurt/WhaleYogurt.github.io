import os, string
def get_filepaths(directory):
    file_paths = []
    for root, directories, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            file_paths.append(filepath)
    return file_paths

path = r'C:\Users\willy\Desktop\GitHub\WhaleYogurt.github.io'
full_file_paths = get_filepaths(path)
toSave = ''
for file in full_file_paths:
    toPrint = file.replace('C:\\Users\\willy\\Desktop\\GitHub\\WhaleYogurt.github.io', 'whaleyogurt.github.io')
    if toPrint != 'whaleyogurt.github.io\index.html':
        if len(toPrint.split('.git')) == 2 or len(toPrint.split('.idea')) == 2:
            toSave += '                "'+toPrint.replace(path[2], '/')+'",\n'
    else:
        toSave += '{\n    "rawData": ["whaleyogurt.github.io",\n'
toSave = toSave[0:len(toSave)-2] +'\n    ]\n}'
with open('API/data.json', 'w') as fh:
    fh.write(toSave)