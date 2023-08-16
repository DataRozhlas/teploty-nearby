# %%
import requests
from bs4 import BeautifulSoup

# %%
# max teploty
r = requests.get('https://www.chmi.cz/files/portal/docs/meteo/ok/open_data/RDATA/TMA/HTML/TMA_kraje.html')
sp = BeautifulSoup(r.text)
# %%
for row in sp.find('table').find_all('a'):
    r = requests.get('https://www.chmi.cz/files/portal/docs/meteo/ok/open_data/RDATA/TMA/HTML/' + row.get('href').lstrip('./'))

    ksp = BeautifulSoup(r.text)
    for rec in ksp.find_all('table')[1].find_all('a'):
        url = 'https://www.chmi.cz/files/portal/docs/meteo/ok/open_data/RDATA/TMA/' + rec.get('href').lstrip('./')
        with open('scratch/' + url.split('/')[-1], 'wb') as f:
            fl = requests.get(url)
            f.write(fl.content)
# %%

# %%
url
# %%
r
# %%
ksp
# %%
