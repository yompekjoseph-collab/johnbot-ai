import express from 'express';

const router = express.Router();

// Simple embeddable widget script (iframe-based) that loads a secure widget from the backend.
// This is a starting point and can be extended for customization per client.
router.get('/widget.js', (req, res) => {
  const script = `
(function(){
  var w=window, d=document;
  var init=function(){
    var script=document.currentScript;
    var src=script.src;
    var params=new URL(src).searchParams;
    var clientId=params.get('clientId');
    var token=params.get('token');
    var target=params.get('target')||'body';

    var container=document.createElement('div');
    container.id='johnblex-widget';
    container.style.position='fixed';
    container.style.bottom='16px';
    container.style.right='16px';
    container.style.width='320px';
    container.style.height='520px';
    container.style.boxShadow='0 18px 38px rgba(0,0,0,0.25)';
    container.style.borderRadius='22px';
    container.style.overflow='hidden';
    container.style.zIndex='999999';

    var iframe=document.createElement('iframe');
    var iframeSrc = '${process.env.BACKEND_URL || 'http://localhost:4000'}/widget/embed?clientId='+encodeURIComponent(clientId);
    if (token) iframeSrc += '&token=' + encodeURIComponent(token);
    iframe.src = iframeSrc;
    iframe.style.border='0';
    iframe.style.width='100%';
    iframe.style.height='100%';

    container.appendChild(iframe);
    (document.querySelector(target) || document.body).appendChild(container);
  };
  if (d.readyState==='complete') init(); else w.addEventListener('load', init);
})();
  `.trim();

  res.setHeader('Content-Type', 'application/javascript');
  res.send(script);
});

export default router;
