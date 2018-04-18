var popupS = require('popups');

// [x] should appear only when a new visitor arrives
// [ ] should not appear when there is no order in dfp
displaySplash = () => {
  popupS.modal({
    content:
`<!-- /43271057/AAA_Static_interstitial -->
<div id='div-gpt-ad-1523874209243-0'>
  <script>
    googletag.cmd.push(function() {
      googletag.display('div-gpt-ad-1523874209243-0');
    });
  </script>
</div>`
  });
}

firstVisit = () => {
  var ls = localStorage.getItem('namespace.visited');

  if (ls == null) {
    localStorage.setItem( 'namespace.visited', 1 );
    return true
  } else {
    return false
  }
}

if (firstVisit()) displaySplash();
