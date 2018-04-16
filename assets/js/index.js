var popupS = require('popups');
var ls = localStorage.getItem('namespace.visited');

if (ls == null) {
  popupS.modal({
      content: `<!-- /43271057/AAA_Static_interstitial -->
<div id='div-gpt-ad-1523874209243-0'>
  <script>
    googletag.cmd.push(function() {
      googletag.display('div-gpt-ad-1523874209243-0');
    });
  </script>
</div>`
  });
  localStorage.setItem( 'namespace.visited', 1 )
}

// if #div-gpt-ad-1523874209243-0 hasn't propetty 'display: none'

// var dfpContent = document.getElementById("div-gpt-ad-1523874209243-0");
// var visible = window.getComputedStyle(dfpContent, null).getPropertyValue("display")

isHidden = el => {
  var style = window.getComputedStyle(el);
  return (style.display === 'none')
};

window.onload = function() {
  console.log(isHidden(document.getElementById('div-gpt-ad-1523874209243-0')));
}
