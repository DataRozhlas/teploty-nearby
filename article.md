title: "Tropických dní přibývá po celé republice. Podívejte se, jak je to u vás"
perex: "Podívejte se, jaké vedro máte na dvorku."
coverimg: https://interaktivni.rozhlas.cz/brexit/media/cover.jpg
coverimg_note: "Foto <a href='https://ctk.cz'>ČTK</a>"
styles: []
libraries: [jquery, highcharts, 'https://code.highcharts.com/modules/annotations.js'] #jquery, d3, highcharts, datatables
options: [noheader, nopic] #wide, noheader (, nopic)
---


<wide>
<form action="?" id='frm-geocode'>
	  <div class="inputs">
	    <input type="text" id="inp-geocode" placeholder="Zadejte obec či adresu...">
		<input type="number" min="0" step="1" id="inp-age" placeholder="váš věk">
	    <input type="submit" id="inp-btn" value="Najít">
	  </div>
	</form>
<div id="graf"></div>
</wide>