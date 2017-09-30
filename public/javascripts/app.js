var controller = new ScrollMagic.Controller();
new ScrollMagic.Scene({
  triggerElement: ".fade"
})
.setTween(".fade", 0.5, {opacity: 1}) // trigger a TweenMax.to tween
.addTo(controller);
