import json

to_exclude = 129
with open("colision.json") as f:
    content = f.read()
obj = json.loads(content)
for i in range(len(obj['layers'][0]['data'])) :
    print("1" if obj['layers'][0]['data'][i] != to_exclude else '0', end='')
    if (i + 1) % obj['width'] == 0 and i != 0 :
        print("")