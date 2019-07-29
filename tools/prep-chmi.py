#%%
import pandas as pd
import os
import json

#%%
out = {}
for f in os.listdir('scratch'):
    if f.endswith('.xls'):
        tmp = pd.read_excel('scratch/' + f, skiprows=3, sheetname='teplota maximální')
        if f not in out:
            out[f.rstrip('.xls')] = {}
        for rok in tmp.iterrows():
            r = str(int(rok[1]['rok']))
            m = str(int(rok[1]['měsíc']))
            for i in range(1, 32):
                v = rok[1][str(i) + '.']
                out[f.rstrip('.xls')][r + '-' + m + '-' + str(i)] = v
#%%
o = {}
for rec in out:
    if rec not in o:
        o[rec] = {}
    for zaz in out[rec]:
        if zaz.split('-')[0] not in o[rec]:
            o[rec][zaz.split('-')[0]] = 0
        if out[rec][zaz] >= 30:
            o[rec][zaz.split('-')[0]] += 1

#%%
with open('./js/data.js', 'w', encoding='utf-8') as f:
    f.write('export const maxtemps = ' + json.dumps(o, ensure_ascii=False))

#%%
def parseLoc(val):
    st = float(val.split('°')[0])
    mins =  float(val.split('°')[1].split("'")[0])
    secs = float(val.split("'")[1])
    return round(st + mins/60 + secs/3600, 8) 

locs = {}
for f in os.listdir('scratch'):
    if f.endswith('.xls'):
        loctmp = pd.read_excel('scratch/' + f, header=None, sheetname='geografie stanice')
        loctmp.dropna(subset=[5], inplace=True)
        v = loctmp[loctmp[5].str.contains('°')].values[-1]
        locs[v[0]] = [v[2], parseLoc(v[5]), parseLoc(v[6]), v[7]]
#%%
with open('./js/locs.js', 'w', encoding='utf-8') as f:
    f.write('export const stations = ' + json.dumps(locs, ensure_ascii=False))
