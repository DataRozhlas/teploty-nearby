# %%
import os
import pandas as pd
import json

# %%
maxtemps = {}
stations = {}
# %%
for fle in os.listdir('scratch/'):
    with open('scratch/' + fle, encoding='windows-1250') as f:
        lns = f.readlines()

        mtd_ind = lns.index('METADATA\n') + 2
        p = lns[mtd_ind].split(';')

        s_id = p[0]
        stations[s_id] = [
            p[1],
            float(p[5].replace(',', '.')),
            float(p[4].replace(',', '.')),
            float(p[6].rstrip('\n').replace(',', '.'))
        ]

        d_ind = lns.index('DATA\n') + 2
        for line in lns[d_ind:]:
            l = line.split(';')
            if s_id not in maxtemps:
                maxtemps[s_id] = {}
            if l[0] not in maxtemps[s_id]:
                maxtemps[s_id][l[0]] = 0
            
            val = 0
            try:
                val = float(l[3].replace(',', '.'))
            except:
                pass
            
            if val >= 30:
                maxtemps[s_id][l[0]] += 1

# %%
# uklid prazdnejch stanic
to_clean = []
for rec in maxtemps:
    if ('2022' not in maxtemps[rec].keys()) & ('2021' not in maxtemps[rec].keys()) & ('2020' not in maxtemps[rec].keys()):
        to_clean.append(rec)

for c in to_clean:
    maxtemps.pop(c)
    stations.pop(c)

# %%
with open('../js/locs.js', 'w') as f:
    f.write('export const stations = ' + json.dumps(stations, ensure_ascii=False) + ';')
# %%
with open('../js/data.js', 'w') as f:
    f.write('export const maxtemps = ' + json.dumps(maxtemps, ensure_ascii=False) + ';')
# %%
