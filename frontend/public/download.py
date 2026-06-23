import urllib.request
url = 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Mykingdom.png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        with open('E:\\Web2_\\e-commerce-microservices\\frontend\\public\\logo1.png', 'wb') as out_file:
            out_file.write(response.read())
except Exception as e:
    print(e)
