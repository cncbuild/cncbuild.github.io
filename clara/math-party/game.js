/**
 * Math Party — Phaser 3 rebuild
 * Fairy-tale math game with body-part-aware prize placement.
 */

(function () {
  'use strict';

  var GAME_W = 540;
  var GAME_H = 960;
  var TILE = 52;
  var ROWS = 7, COLS = 7;
  var TARGET_CORRECT = 10;

  var CHARACTERS = [
    { id: 'doll', name: 'American Girl Doll', icon: '🪆' },
    { id: 'unicorn', name: 'Unicorn', icon: '🦄' },
    { id: 'dog', name: 'Dog', icon: '🐕' },
    { id: 'bunny', name: 'Bunny', icon: '🐰' },
    { id: 'cat', name: 'Cat', icon: '🐱' },
    { id: 'fish', name: 'Fish', icon: '🐠' },
    { id: 'butterfly', name: 'Butterfly', icon: '🦋' },
    { id: 'ladybug', name: 'Ladybug', icon: '🐞' },
    { id: 'worm', name: 'Worm', icon: '🪱' }
  ];

  var PRIZES_BY_CHARACTER = {
    doll: ['Sparkly Dress', 'Tiara', 'Mini Purse', 'Shoes', 'Necklace', 'Bow', 'Backpack', 'Book', 'Teddy Bear', 'Tea Set', 'Bicycle', 'Skates', 'Party Hat', 'Bracelet', 'Sunglasses'],
    unicorn: ['Golden Horn', 'Rainbow Saddle', 'Sparkle Wings', 'Flower Crown', 'Star Charm', 'Magic Wand', 'Crystal', 'Ribbon', 'Bell', 'Flower Wreath', 'Gem Collar', 'Cloud Blanket', 'Moon Necklace', 'Sun Crown', 'Fairy Dust'],
    dog: ['Collar', 'Toy Bone', 'Bandana', 'Bow', 'Dog Bowl', 'Leash', 'Treat Jar', 'Bed', 'Ball', 'Frisbee', 'Hat', 'Sweater', 'Badge', 'Backpack', 'Chew Toy'],
    bunny: ['Bow', 'Carrot Toy', 'Basket', 'Ribbon', 'Flower', 'Bell', 'Mini Hat', 'Scarf', 'Carrot Bag', 'Flower Crown', 'Egg Toy', 'Leaf Umbrella', 'Berry Basket', 'Patch Blanket', 'Carrot Necklace'],
    cat: ['Bow Tie', 'Toy Mouse', 'Collar', 'Cat Bed', 'Bell', 'Ribbon', 'Fish Toy', 'Hat', 'Scarf', 'Glasses', 'Crown', 'Bow', 'Yarn Ball', 'Feather Toy', 'Blanket'],
    fish: ['Castle', 'Seaweed', 'Treasure Chest', 'Bubble Ring', 'Shell', 'Star', 'Plant', 'Rock Cave', 'Pearl', 'Coral', 'Ship Wheel', 'Anchor', 'Diver', 'Shell House', 'Sea Star'],
    butterfly: ['Flower Crown', 'Wing Clip', 'Tiny Crown', 'Ribbon', 'Dew Drop', 'Leaf Cape', 'Flower', 'Sparkle Dust', 'Berry Necklace', 'Petal Dress', 'Stem Belt', 'Seed Pouch', 'Leaf Hat', 'Vine Bracelet', 'Blossom'],
    ladybug: ['Leaf Umbrella', 'Spot Stickers', 'Tiny Crown', 'Flower', 'Dew Hat', 'Leaf Cape', 'Berry', 'Stem Scarf', 'Seed Beads', 'Petal Bow', 'Leaf Blanket', 'Daisy', 'Clover', 'Rain Drop', 'Sun Hat'],
    worm: ['Tiny Hat', 'Glasses', 'Apple Slice', 'Leaf Cape', 'Flower', 'Bow', 'Berry', 'Leaf Umbrella', 'Soil Blanket', 'Seed Pack', 'Tiny Scarf', 'Leaf Crown', 'Strawberry', 'Pea Pod', 'Carrot Top']
  };

  // Prize name -> icon key (for texture lookup)
  var PRIZE_TO_ICON = {
    'Sparkly Dress': 'dress', 'Tiara': 'crown', 'Mini Purse': 'bag', 'Shoes': 'skates', 'Necklace': 'necklace', 'Bow': 'bow', 'Backpack': 'bag', 'Book': 'book', 'Teddy Bear': 'toy', 'Tea Set': 'cup', 'Bicycle': 'bicycle', 'Skates': 'skates', 'Party Hat': 'hat', 'Bracelet': 'necklace', 'Sunglasses': 'glasses',
    'Golden Horn': 'horn', 'Rainbow Saddle': 'saddle', 'Sparkle Wings': 'wing', 'Flower Crown': 'crown', 'Star Charm': 'star', 'Magic Wand': 'wand', 'Crystal': 'crystal', 'Ribbon': 'bow', 'Bell': 'bell', 'Flower Wreath': 'flower', 'Gem Collar': 'collar', 'Cloud Blanket': 'blanket', 'Moon Necklace': 'necklace', 'Sun Crown': 'crown', 'Fairy Dust': 'sparkle',
    'Collar': 'collar', 'Toy Bone': 'bone', 'Bandana': 'scarf', 'Dog Bowl': 'bowl', 'Leash': 'collar', 'Treat Jar': 'cup', 'Bed': 'blanket', 'Ball': 'ball', 'Frisbee': 'ball', 'Hat': 'hat', 'Sweater': 'dress', 'Badge': 'star', 'Chew Toy': 'toy',
    'Carrot Toy': 'carrot', 'Basket': 'bag', 'Flower': 'flower', 'Mini Hat': 'hat', 'Scarf': 'scarf', 'Carrot Bag': 'bag', 'Egg Toy': 'egg', 'Leaf Umbrella': 'umbrella', 'Berry Basket': 'bag', 'Patch Blanket': 'blanket', 'Carrot Necklace': 'necklace',
    'Bow Tie': 'bowtie', 'Toy Mouse': 'toy', 'Cat Bed': 'blanket', 'Fish Toy': 'fish', 'Glasses': 'glasses', 'Crown': 'crown', 'Yarn Ball': 'ball', 'Feather Toy': 'toy', 'Blanket': 'blanket',
    'Seaweed': 'leaf', 'Treasure Chest': 'bag', 'Bubble Ring': 'pearl', 'Plant': 'flower', 'Rock Cave': 'castle', 'Pearl': 'pearl', 'Coral': 'flower', 'Ship Wheel': 'star', 'Anchor': 'bone', 'Diver': 'toy', 'Shell House': 'shell', 'Sea Star': 'star',
    'Wing Clip': 'wing', 'Tiny Crown': 'crown', 'Dew Drop': 'pearl', 'Leaf Cape': 'blanket', 'Sparkle Dust': 'sparkle', 'Berry Necklace': 'necklace', 'Petal Dress': 'dress', 'Stem Belt': 'scarf', 'Seed Pouch': 'bag', 'Leaf Hat': 'hat', 'Vine Bracelet': 'necklace', 'Blossom': 'flower',
    'Leaf Umbrella': 'umbrella', 'Spot Stickers': 'sparkle', 'Tiny Crown': 'crown', 'Dew Hat': 'hat', 'Leaf Cape': 'blanket', 'Berry': 'flower', 'Stem Scarf': 'scarf', 'Seed Beads': 'pearl', 'Petal Bow': 'bow', 'Leaf Blanket': 'blanket', 'Daisy': 'flower', 'Clover': 'leaf', 'Rain Drop': 'pearl', 'Sun Hat': 'hat',
    'Tiny Hat': 'hat', 'Glasses': 'glasses', 'Apple Slice': 'flower', 'Leaf Cape': 'blanket', 'Soil Blanket': 'blanket', 'Seed Pack': 'bag', 'Tiny Scarf': 'scarf', 'Leaf Crown': 'crown', 'Strawberry': 'flower', 'Pea Pod': 'leaf', 'Carrot Top': 'carrot'
  };

  // Body-part slots: where each prize type goes on the character (x,y offset from center, scale)
  var SLOTS = {
    head:      { x: 0,  y: -32, scale: 1 },
    neck:      { x: 0,  y: -8,  scale: 0.9 },
    body:      { x: 0,  y: 12,  scale: 1.1 },
    leftHand:  { x: -26, y: 8,  scale: 0.85 },
    rightHand: { x: 26,  y: 8,  scale: 0.85 },
    feet:      { x: 0,  y: 36,  scale: 0.9 },
    back:      { x: 0,  y: 4,   scale: 1 },
    headLeft:  { x: -18, y: -28, scale: 0.7 },
    headRight: { x: 18,  y: -28, scale: 0.7 },
    bodyLower: { x: 0,  y: 26,  scale: 0.9 }
  };

  // Prize name -> body slot (so placement makes sense: hat on head, necklace on neck, etc.)
  var PRIZE_SLOT = {
    'Tiara': 'head', 'Party Hat': 'head', 'Sun Crown': 'head', 'Flower Crown': 'head', 'Mini Hat': 'head', 'Leaf Hat': 'head', 'Dew Hat': 'head', 'Sun Hat': 'head', 'Tiny Hat': 'head', 'Hat': 'head', 'Leaf Crown': 'head', 'Golden Horn': 'head',
    'Necklace': 'neck', 'Bracelet': 'neck', 'Gem Collar': 'neck', 'Moon Necklace': 'neck', 'Carrot Necklace': 'neck', 'Berry Necklace': 'neck', 'Vine Bracelet': 'neck', 'Collar': 'neck', 'Bandana': 'neck', 'Scarf': 'neck', 'Stem Scarf': 'neck', 'Tiny Scarf': 'neck',
    'Sparkly Dress': 'body', 'Sweater': 'body', 'Petal Dress': 'body', 'Rainbow Saddle': 'body', 'Cloud Blanket': 'body', 'Patch Blanket': 'body', 'Leaf Blanket': 'body', 'Soil Blanket': 'body', 'Blanket': 'body', 'Cat Bed': 'body', 'Bed': 'body', 'Leaf Cape': 'body',
    'Mini Purse': 'rightHand', 'Backpack': 'back', 'Basket': 'leftHand', 'Carrot Bag': 'leftHand', 'Seed Pouch': 'leftHand', 'Treat Jar': 'leftHand', 'Magic Wand': 'rightHand', 'Book': 'leftHand', 'Tea Set': 'rightHand', 'Dog Bowl': 'leftHand', 'Bubble Ring': 'leftHand', 'Seed Pack': 'leftHand',
    'Teddy Bear': 'rightHand', 'Toy Bone': 'rightHand', 'Toy Mouse': 'rightHand', 'Fish Toy': 'rightHand', 'Yarn Ball': 'rightHand', 'Feather Toy': 'rightHand', 'Chew Toy': 'rightHand', 'Ball': 'rightHand', 'Frisbee': 'rightHand', 'Egg Toy': 'rightHand', 'Diver': 'rightHand',
    'Shoes': 'feet', 'Skates': 'feet',
    'Sparkle Wings': 'back', 'Wing Clip': 'back',
    'Bow': 'headRight', 'Ribbon': 'headLeft', 'Flower': 'headLeft', 'Sparkle Dust': 'headRight', 'Fairy Dust': 'headRight', 'Spot Stickers': 'headLeft', 'Flower Wreath': 'head', 'Dew Drop': 'headLeft', 'Berry': 'headRight', 'Petal Bow': 'headRight', 'Daisy': 'headLeft', 'Clover': 'headLeft', 'Rain Drop': 'headRight', 'Seed Beads': 'neck',
    'Bicycle': 'bodyLower', 'Star Charm': 'neck', 'Crystal': 'rightHand', 'Bell': 'neck', 'Pearl': 'neck', 'Glasses': 'head', 'Sunglasses': 'head', 'Bow Tie': 'neck', 'Carrot Toy': 'rightHand', 'Leaf Umbrella': 'leftHand', 'Castle': 'bodyLower', 'Seaweed': 'body', 'Treasure Chest': 'leftHand', 'Shell': 'leftHand', 'Star': 'headRight', 'Plant': 'body', 'Rock Cave': 'body', 'Coral': 'body', 'Ship Wheel': 'bodyLower', 'Anchor': 'bodyLower', 'Shell House': 'body', 'Sea Star': 'body', 'Apple Slice': 'rightHand', 'Strawberry': 'rightHand', 'Pea Pod': 'body', 'Carrot Top': 'head'
  };

  function getIconKey(prizeName) {
    return PRIZE_TO_ICON[prizeName] || 'gift';
  }

  function getSlotKey(prizeName) {
    return PRIZE_SLOT[prizeName] || 'rightHand';
  }

  // SVG content for each icon (viewBox 0 0 32 32)
  var ICON_SVGS = {
    crown: '<path fill="#c9a227" stroke="#8b6914" stroke-width="1.5" d="M4 22h24v4H4zm4-8l4-6 4 4 4-4 4 6 4-8-6 2-4-4-4 4-6-2 4 8z"/>',
    dress: '<path fill="#e8b4b8" stroke="#8b6b7d" stroke-width="1.2" d="M16 2l-4 6v4h2l-2 14h8l-2-14h2V8l-4-6z"/><path fill="#c9a227" d="M14 8h4v2h-4z"/>',
    bow: '<ellipse fill="#e8b4b8" stroke="#8b6b7d" stroke-width="1.2" cx="16" cy="16" rx="10" ry="6"/><circle fill="#8b6b7d" cx="16" cy="16" r="2"/><path fill="none" stroke="#8b6b7d" stroke-width="1" d="M10 12v8M22 12v8"/>',
    necklace: '<path fill="none" stroke="#c9a227" stroke-width="2" d="M8 14c0-4 4-8 8-8s8 4 8 8"/><circle fill="#c9a227" cx="16" cy="18" r="4"/><circle fill="#fff" cx="16" cy="18" r="1.5"/>',
    hat: '<path fill="#8b6b7d" stroke="#2d2a3a" stroke-width="1" d="M6 12c0 0 6-8 10-8s10 8 10 8v2H6v-2z"/><rect fill="#e8b4b8" x="4" y="14" width="24" height="4" rx="1"/>',
    toy: '<circle fill="#d4a574" stroke="#8b6914" stroke-width="1.2" cx="16" cy="18" r="8"/><circle fill="#2d2a3a" cx="14" cy="16" r="1.5"/><circle fill="#2d2a3a" cx="18" cy="16" r="1.5"/><ellipse fill="#8b6914" cx="16" cy="20" rx="2" ry="1"/>',
    bag: '<path fill="#8b6b7d" stroke="#2d2a3a" stroke-width="1" d="M10 8h12l2 16H8L10 8z"/><path fill="#e8b4b8" d="M12 8v2h8V8h2v2h-2v2h-8v-2h-2V8z"/>',
    book: '<path fill="#a8c5e0" stroke="#5a7a9a" stroke-width="1" d="M8 4v24h16V4H8zm2 2h12v20H10V6z"/><path fill="#8b6b7d" d="M10 10h12v1H10zm0 4h12v1H10zm0 4h8v1h-8z"/>',
    cup: '<path fill="#fff" stroke="#c9a227" stroke-width="1.2" d="M8 6h4l2 4h4l2-4h4v14H8V6z"/><path fill="#e8b4b8" d="M10 8v10h12V8h-2v8h-8V8z"/>',
    bicycle: '<circle fill="none" stroke="#2d2a3a" stroke-width="2" cx="10" cy="22" r="5"/><circle fill="none" stroke="#2d2a3a" stroke-width="2" cx="22" cy="22" r="5"/><path fill="none" stroke="#2d2a3a" stroke-width="1.5" d="M15 22h2l4-10h-4l-2 4M17 12l2 10M22 12l-3 10"/>',
    skates: '<path fill="#8b6b7d" stroke="#2d2a3a" stroke-width="1" d="M6 20l4-12h12l2 8-6 4h-6l-2 4H6z"/><line x1="8" y1="24" x2="24" y2="24" stroke="#2d2a3a" stroke-width="1"/>',
    glasses: '<circle fill="none" stroke="#2d2a3a" stroke-width="1.5" cx="10" cy="16" r="5"/><circle fill="none" stroke="#2d2a3a" stroke-width="1.5" cx="22" cy="16" r="5"/><path fill="none" stroke="#2d2a3a" stroke-width="1.5" d="M15 16h2M6 12l-2-2M26 12l2-2"/>',
    flower: '<circle fill="#c9a227" cx="16" cy="16" r="3"/><ellipse fill="#e8b4b8" cx="16" cy="8" rx="3" ry="5"/><ellipse fill="#e8b4b8" cx="16" cy="24" rx="3" ry="5"/><ellipse fill="#e8b4b8" cx="8" cy="16" rx="5" ry="3"/><ellipse fill="#e8b4b8" cx="24" cy="16" rx="5" ry="3"/>',
    star: '<path fill="#c9a227" d="M16 2l4 10 10 2-7 7 2 10-9-5-9 5 2-10-7-7 10-2z"/>',
    leaf: '<path fill="#7cb87c" stroke="#4a7a4a" stroke-width="1" d="M16 4c-8 8-8 20 0 24s8-16 0-24z"/>',
    bowtie: '<path fill="#8b6b7d" d="M16 12l-6 8h4l2-4 2 4h4l-6-8z"/><path fill="#e8b4b8" d="M10 14l2 4 4-6 4 6 2-4-2-2h-12z"/>',
    collar: '<path fill="none" stroke="#c9a227" stroke-width="2.5" d="M6 16h20"/><circle fill="#c9a227" cx="8" cy="16" r="2.5"/><circle fill="#c9a227" cx="24" cy="16" r="2.5"/><path fill="#8b6b7d" d="M16 14v4h2v-4z"/>',
    saddle: '<path fill="#8b6914" stroke="#5a450a" stroke-width="1" d="M6 14c0 0 4-6 10-6s10 6 10 6v4H6v-4z"/><path fill="#d4a574" d="M8 16h16v4H8z"/>',
    wing: '<path fill="#a8c5e0" stroke="#5a7a9a" stroke-width="1" d="M16 8c-6 4-10 12-10 20l10-4 10 4c0-8-4-16-10-20z"/>',
    wand: '<path fill="#c9a227" stroke="#8b6914" stroke-width="1" d="M20 4l2 4-8 8-2-2 8-8z"/><path fill="#a8c5e0" d="M14 10l8 8-12 12-8-8z"/>',
    crystal: '<path fill="#a8c5e0" stroke="#5a7a9a" stroke-width="1" d="M16 2l12 14-6 14H10l-6-14z"/><path fill="rgba(255,255,255,0.4)" d="M16 6l8 10-4 10h-8l-4-10z"/>',
    bell: '<path fill="#c9a227" stroke="#8b6914" stroke-width="1" d="M16 4c-4 0-8 3-8 8v4c0 4-2 6-4 8h24c-2-2-4-4-4-8v-4c0-5-4-8-8-8z"/><path fill="#8b6914" d="M16 24c2 0 4-1 4-4h-8c0 3 2 4 4 4z"/>',
    blanket: '<rect fill="#e8b4b8" stroke="#8b6b7d" stroke-width="1" x="4" y="8" width="24" height="16" rx="2"/><path fill="#c9a227" d="M8 12h4v4H8zm8 0h4v4h-4zm-8 8h4v2H8zm8 0h4v2h-4z"/>',
    ball: '<circle fill="#e8b4b8" stroke="#8b6b7d" stroke-width="1.5" cx="16" cy="16" r="10"/><path fill="none" stroke="#8b6b7d" stroke-width="1" d="M16 6c-4 4-6 10-6 10s2 6 6 10 6-4 10-6-4-6-10-10z"/>',
    fish: '<ellipse fill="#5a7a9a" cx="16" cy="16" rx="10" ry="6"/><path fill="#a8c5e0" d="M8 16h14l-4 4 6 2-2-6 4-4H8z"/><circle fill="#2d2a3a" cx="20" cy="15" r="1.5"/>',
    carrot: '<path fill="#e8754a" stroke="#c95a2a" stroke-width="1" d="M16 8l-4 20h8L16 8z"/><path fill="#7cb87c" d="M14 8l2 2 2-2-2-2z"/>',
    egg: '<ellipse fill="#fef9f0" stroke="#d4c9b8" stroke-width="1.2" cx="16" cy="18" rx="8" ry="10"/><path fill="rgba(255,255,255,0.5)" d="M12 14c2-1 6 0 8 2-1 4-4 6-8 6-3-2-2-6 0-8z"/>',
    umbrella: '<path fill="#a8c5e0" stroke="#5a7a9a" stroke-width="1" d="M16 4v2C8 8 4 14 4 20h24c0-6-4-12-12-14V4h-4z"/><path fill="#8b6b7d" d="M15 20v8h2v-8z"/>',
    scarf: '<path fill="#e8b4b8" stroke="#8b6b7d" stroke-width="1" d="M6 14h20v6H6z"/><path fill="#c9a227" d="M6 14l4-4 4 4v6H6z"/>',
    horn: '<path fill="#c9a227" stroke="#8b6914" stroke-width="1" d="M18 4l2 24-4 2-2-12-4 10-2-24 10 0z"/>',
    bowl: '<ellipse fill="#e8dfd0" stroke="#c4b59a" stroke-width="1" cx="16" cy="18" rx="10" ry="4"/><path fill="none" stroke="#c4b59a" stroke-width="1" d="M8 18c0 0 2 4 8 4s8-4 8-4"/>',
    bone: '<path fill="#f5efe6" stroke="#c4b59a" stroke-width="1.2" d="M8 14c-2 0-2 2-2 4s0 4 2 4h2v-2H8v-2h18v2h-2v2h2c2 0 2-2 2-4s0-4-2-4H10v2h16v2H8z"/>',
    castle: '<path fill="#a8c5e0" stroke="#5a7a9a" stroke-width="1" d="M4 32V12h8v6h8v-6h8v20H4z"/><rect fill="#8b6b7d" x="12" y="18" width="8" height="14"/><path fill="#c9a227" d="M2 12l6-8 6 4 6-4 6 4 6-8v8h-4v12H4V12H2z"/>',
    shell: '<path fill="#e8dfd0" stroke="#c4b59a" stroke-width="1" d="M16 4c-8 6-12 14-12 22 0 0 12-4 12-4s12 4 12 4c0-8-4-16-12-22z"/>',
    pearl: '<circle fill="#fef9f0" stroke="#d4c9b8" stroke-width="1" cx="16" cy="16" r="6"/><path fill="rgba(255,255,255,0.8)" d="M12 14c2 0 4 2 4 4s-2 4-4 4c0-2 2-4 4-4s-2-2-4-2z"/>',
    sparkle: '<path fill="#c9a227" d="M16 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path fill="#c9a227" opacity="0.8" d="M8 20l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/><path fill="#c9a227" opacity="0.6" d="M22 24l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
    gift: '<rect fill="#e8b4b8" x="6" y="12" width="20" height="12" rx="1"/><path fill="#7cb87c" d="M16 12V8l-4 2 2 2h2zm0 0l4-2 2 2h-6z"/><path fill="#c9a227" d="M14 12h4v12h-4zm0 12h8v4h-8z"/>'
  };

  function svgToDataUrl(svgContent) {
    var full = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' + svgContent + '</svg>';
    try {
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(full)));
    } catch (e) {
      return null;
    }
  }

  var BootScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: 'Boot' });
    },
    preload: function () {
      var icons = Object.keys(ICON_SVGS);
      icons.forEach(function (key) {
        var url = svgToDataUrl(ICON_SVGS[key]);
        if (url) this.load.image('icon-' + key, url);
      }, this);
      [['player-boy', '👦'], ['player-girl', '👧']].forEach(function (entry) {
        var key = entry[0];
        var emoji = entry[1];
        var c = document.createElement('canvas');
        c.width = 64;
        c.height = 80;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fef9f0';
        ctx.fillRect(0, 0, 64, 80);
        ctx.font = '56px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 32, 40);
        try {
          this.load.image(key, c.toDataURL('image/png'));
        } catch (e) {}
      }, this);
    },
    create: function () {
      this.registry.set('character', null);
      this.registry.set('playerType', null);
      this.registry.set('prizesWon', []);
      this.registry.set('correctCount', 0);
      this.registry.set('totalAsked', 0);
      this.registry.set('prizePositions', []);
      this.registry.set('playerRow', 0);
      this.registry.set('playerCol', 0);
      this.scene.start('CharacterSelect');
    }
  });

  var CharacterSelectScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: 'CharacterSelect' });
    },
    create: function () {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      this.add.rectangle(0, 0, w * 2, h * 2, 0xfef9f0).setOrigin(0);
      this.add.text(w / 2, 36, 'Math Party', { fontFamily: 'Georgia', fontSize: 36, color: '#8b6b7d' }).setOrigin(0.5);
      this.add.text(w / 2, 72, 'Play as', { fontFamily: 'Arial', fontSize: 16, color: '#8b6b7d' }).setOrigin(0.5);
      var playerType = this.registry.get('playerType');
      var boxW = 80;
      var boxH = 72;
      var boyX = w / 2 - 70;
      var girlX = w / 2 + 70;
      var boxCenterY = 132;
      var boyFill = playerType === 'boy' ? 0xb8d4c8 : 0xf5efe6;
      var girlFill = playerType === 'girl' ? 0xb8d4c8 : 0xf5efe6;
      var boyBorder = playerType === 'boy' ? 0x2d7a4a : 0xe8b4b8;
      var girlBorder = playerType === 'girl' ? 0x2d7a4a : 0xe8b4b8;
      var boyBtn = this.add.rectangle(boyX, boxCenterY, boxW, boxH, boyFill, 1).setStrokeStyle(3, boyBorder);
      var girlBtn = this.add.rectangle(girlX, boxCenterY, boxW, boxH, girlFill, 1).setStrokeStyle(3, girlBorder);
      var imgScale = 0.38;
      var imgY = boxCenterY - 14;
      if (this.textures.exists('player-boy')) this.add.sprite(boyX, imgY, 'player-boy').setScale(imgScale);
      else this.add.text(boyX, imgY, '👦', { fontSize: 28 }).setOrigin(0.5);
      if (this.textures.exists('player-girl')) this.add.sprite(girlX, imgY, 'player-girl').setScale(imgScale);
      else this.add.text(girlX, imgY, '👧', { fontSize: 28 }).setOrigin(0.5);
      var labelY = boxCenterY + 26;
      this.add.text(boyX, labelY, 'Boy', { fontFamily: 'Arial', fontSize: 12, color: '#8b6b7d' }).setOrigin(0.5);
      this.add.text(girlX, labelY, 'Girl', { fontFamily: 'Arial', fontSize: 12, color: '#8b6b7d' }).setOrigin(0.5);
      var boyHit = this.add.rectangle(boyX, boxCenterY, boxW, boxH, 0x000000, 0).setInteractive({ useHandCursor: true });
      var girlHit = this.add.rectangle(girlX, boxCenterY, boxW, boxH, 0x000000, 0).setInteractive({ useHandCursor: true });
      boyHit.on('pointerdown', function () { this.registry.set('playerType', 'boy'); this.scene.restart(); }, this);
      girlHit.on('pointerdown', function () { this.registry.set('playerType', 'girl'); this.scene.restart(); }, this);

      this.add.text(w / 2, 184, 'Choose your friend', { fontFamily: 'Arial', fontSize: 18, color: '#8b6b7d' }).setOrigin(0.5);
      var selected = this.registry.get('character');
      var startBtn = this.add.text(w / 2, h - 60, 'Start Adventure', { fontFamily: 'Arial', fontSize: 22, color: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      var btnBg = this.add.rectangle(w / 2, h - 60, 200, 48, 0xc9a227).setOrigin(0.5);
      this.children.bringToTop(startBtn);
      if (!selected || !playerType) { startBtn.setAlpha(0.5); btnBg.setAlpha(0.5); }

      var cols = 3;
      var rows = 3;
      var cellSpacing = Math.min(100, (w - 40) / cols - 20);
      var contentTop = 184 + 24;
      var contentBottom = h - 60 - 48 - 24;
      var zoneHeight = Math.min(contentBottom - contentTop, 340);
      var zoneCenterY = contentTop + zoneHeight / 2;
      var startY = zoneCenterY - (rows - 1) * (cellSpacing / 2);
      var startX = w / 2 - (cols - 1) * (cellSpacing / 2);
      CHARACTERS.forEach(function (ch, i) {
        var col = i % cols;
        var row = Math.floor(i / cols);
        var x = startX + col * cellSpacing;
        var y = startY + row * cellSpacing;
        var boxFill = selected && selected.id === ch.id ? 0xb8d4c8 : 0xf5efe6;
        var boxBorder = selected && selected.id === ch.id ? 0x2d7a4a : 0xe8b4b8;
        var box = this.add.rectangle(x, y, 88, 88, boxFill, 1).setStrokeStyle(3, boxBorder).setInteractive({ useHandCursor: true });
        var emoji = this.add.text(x, y - 12, ch.icon, { fontSize: 40 }).setOrigin(0.5);
        var label = this.add.text(x, y + 28, ch.name, { fontFamily: 'Arial', fontSize: 11, color: '#8b6b7d', align: 'center', wordWrap: { width: 80 } }).setOrigin(0.5);
        box.on('pointerdown', function () {
          this.registry.set('character', ch);
          this.scene.restart();
        }, this);
      }, this);

      startBtn.on('pointerdown', function () {
        if (this.registry.get('character') && this.registry.get('playerType')) this.scene.start('GameBoard');
      }, this);
      btnBg.setInteractive({ useHandCursor: true }).on('pointerdown', function () {
        if (this.registry.get('character') && this.registry.get('playerType')) this.scene.start('GameBoard');
      }, this);
    }
  });

  function buildCharacterWithPrizes(scene, x, y, character, prizesWon, scale) {
    scale = scale || 1;
    var container = scene.add.container(x, y);
    var base = scene.add.text(0, 0, character.icon, { fontSize: Math.round(64 * scale) }).setOrigin(0.5);
    container.add(base);
    var slotCounts = {};
    prizesWon.forEach(function (prizeName) {
      var slotKey = getSlotKey(prizeName);
      var slot = SLOTS[slotKey] || SLOTS.rightHand;
      var idx = (slotCounts[slotKey] || 0);
      slotCounts[slotKey] = idx + 1;
      var offY = idx * 6;
      var iconKey = 'icon-' + getIconKey(prizeName);
      if (!scene.textures.exists(iconKey)) iconKey = 'icon-gift';
      var spr = scene.add.sprite(slot.x, slot.y + offY, iconKey).setScale((slot.scale || 1) * scale * 1.2);
      container.add(spr);
    });
    return container;
  }

  var GameBoardScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: 'GameBoard' });
    },
    init: function () {
      this.cursors = null;
      this.playerSprite = null;
      this.prizeSprites = [];
      this.moving = false;
    },
    create: function () {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var character = this.registry.get('character');
      if (!character) {
        this.scene.start('CharacterSelect');
        return;
      }

      var prizesWon = this.registry.get('prizesWon');
      var prizePositions = this.registry.get('prizePositions');
      var playerRow = this.registry.get('playerRow');
      var playerCol = this.registry.get('playerCol');

      if (prizePositions.length === 0) {
        var pool = PRIZES_BY_CHARACTER[character.id] || [];
        var used = {};
        var cells = [];
        for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (r !== 0 || c !== 0) cells.push([r, c]);
        for (var i = 0; i < 15; i++) {
          var idx = Phaser.Math.Between(0, cells.length - 1);
          var cell = cells.splice(idx, 1)[0];
          var name = pool[Phaser.Math.Between(0, pool.length - 1)];
          while (used[name] && Object.keys(used).length < pool.length) name = pool[Phaser.Math.Between(0, pool.length - 1)];
          used[name] = true;
          prizePositions.push({ row: cell[0], col: cell[1], name: name });
        }
        this.registry.set('prizePositions', prizePositions);
      }

      this.add.rectangle(0, 0, w * 2, h * 2, 0xfef9f0).setOrigin(0);

      var tileW = TILE;
      var tileH = TILE;
      var boardPixelW = COLS * tileW;
      var boardPixelH = ROWS * tileH;
      var boardOriginX = (w - boardPixelW) / 2;
      var boardOriginY = 192;

      var playerType = this.registry.get('playerType') || 'boy';
      var playerKey = 'player-' + playerType;
      var headerCharCenterY = 78;
      if (this.textures.exists(playerKey)) {
        this.add.sprite(w / 2 - 108, headerCharCenterY, playerKey).setScale(0.76);
      } else {
        this.add.text(w / 2 - 108, headerCharCenterY, playerType === 'boy' ? '👦' : '👧', { fontSize: 56 }).setOrigin(0.5);
      }
      this.add.text(w / 2, 16, character.name, { fontFamily: 'Arial', fontSize: 16, color: '#8b6b7d' }).setOrigin(0.5, 0);
      buildCharacterWithPrizes(this, w / 2, headerCharCenterY, character, prizesWon, 0.72);
      this.add.text(w / 2, 142, 'Prizes: ' + prizesWon.length + ' / ' + TARGET_CORRECT, { fontFamily: 'Arial', fontSize: 13, color: '#8b6b7d' }).setOrigin(0.5);
      var numShow = Math.min(prizesWon.length, 6);
      var prizeIconStartX = numShow > 0 ? w / 2 - (numShow - 1) * 22 : w / 2;
      prizesWon.slice(-6).forEach(function (name, i) {
        var iconKey = 'icon-' + (getIconKey(name) || 'gift');
        if (!this.textures.exists(iconKey)) iconKey = 'icon-gift';
        this.add.sprite(prizeIconStartX + i * 44, 162, iconKey).setScale(0.5);
      }, this);

      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var tx = boardOriginX + c * tileW + tileW / 2;
          var ty = boardOriginY + r * tileH + tileH / 2;
          var tile = this.add.rectangle(tx, ty, tileW - 4, tileH - 4, 0xf5efe6).setStrokeStyle(2, 0xc4b59a);
        }
      }

      prizePositions.forEach(function (p) {
        var tx = boardOriginX + p.col * tileW + tileW / 2;
        var ty = boardOriginY + p.row * tileH + tileH / 2;
        var iconKey = 'icon-' + (getIconKey(p.name) || 'gift');
        if (!this.textures.exists(iconKey)) iconKey = 'icon-gift';
        var spr = this.add.sprite(tx, ty, iconKey).setScale(0.82);
        spr.setData('prize', p);
        this.prizeSprites.push(spr);
      }, this);

      var playerPixelX = boardOriginX + playerCol * tileW + tileW / 2;
      var playerPixelY = boardOriginY + playerRow * tileH + tileH / 2;
      if (this.textures.exists(playerKey)) {
        this.playerSprite = this.add.sprite(playerPixelX, playerPixelY, playerKey).setScale(0.52);
      } else {
        this.playerSprite = this.add.text(playerPixelX, playerPixelY, playerType === 'boy' ? '👦' : '👧', { fontSize: 38 }).setOrigin(0.5);
      }
      this.playerSprite.setData('row', playerRow);
      this.playerSprite.setData('col', playerCol);
      this.registry.set('boardOrigin', { x: boardOriginX, y: boardOriginY });

      this.cursors = this.input.keyboard.createCursorKeys();

      this.add.text(w / 2, h - 24, 'Arrow keys to move • Land on a prize to solve a problem', { fontFamily: 'Arial', fontSize: 14, color: '#8b6b7d' }).setOrigin(0.5);
    },
    update: function () {
      if (this.moving) return;
      var character = this.registry.get('character');
      var prizePositions = this.registry.get('prizePositions');
      var origin = this.registry.get('boardOrigin');
      if (!origin) return;
      var row = this.playerSprite.getData('row');
      var col = this.playerSprite.getData('col');
      var tileW = TILE, tileH = TILE;
      var newRow = row, newCol = col;
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) newCol = Math.max(0, col - 1);
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) newCol = Math.min(COLS - 1, col + 1);
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) newRow = Math.max(0, row - 1);
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) newRow = Math.min(ROWS - 1, row + 1);
      if (newRow === row && newCol === col) return;
      this.moving = true;
      var targetX = origin.x + newCol * tileW + tileW / 2;
      var targetY = origin.y + newRow * tileH + tileH / 2;
      this.tweens.add({
        targets: this.playerSprite,
        x: targetX,
        y: targetY,
        duration: 180,
        ease: 'Power2',
        onComplete: function () {
          this.playerSprite.setData('row', newRow);
          this.playerSprite.setData('col', newCol);
          this.registry.set('playerRow', newRow);
          this.registry.set('playerCol', newCol);
          this.moving = false;
          var prize = prizePositions.find(function (p) { return p.row === newRow && p.col === newCol; });
          if (prize) {
            this.registry.set('currentPrize', prize);
            this.scene.start('MathProblem');
          }
        },
        callbackScope: this
      });
    }
  });

  var MathProblemScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: 'MathProblem' });
    },
    create: function () {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var prize = this.registry.get('currentPrize');
      if (!prize) {
        this.scene.start('GameBoard');
        return;
      }
      this.add.rectangle(0, 0, w * 2, h * 2, 0xfef9f0).setOrigin(0);
      this.add.text(w / 2, 40, 'Solve to win the prize!', { fontFamily: 'Georgia', fontSize: 24, color: '#8b6b7d' }).setOrigin(0.5);
      var iconKey = 'icon-' + (getIconKey(prize.name) || 'gift');
      if (!this.textures.exists(iconKey)) iconKey = 'icon-gift';
      this.add.sprite(w / 2, 100, iconKey).setScale(1.35);
      this.add.text(w / 2, 138, 'Win: ' + prize.name, { fontFamily: 'Arial', fontSize: 14, color: '#8b6b7d' }).setOrigin(0.5);

      var a = Phaser.Math.Between(0, 10);
      var b = Phaser.Math.Between(0, 10);
      var sum = a + b;
      var wrongSet = new Set([sum]);
      while (wrongSet.size < 4) {
        wrongSet.add(Phaser.Math.Between(0, 20));
      }
      var options = Phaser.Utils.Array.Shuffle(Array.from(wrongSet)).slice(0, 4);
      if (options.indexOf(sum) === -1) options[Phaser.Math.Between(0, 3)] = sum;

      this.add.text(w / 2, 200, a + ' + ' + b + ' = ?', { fontFamily: 'Georgia', fontSize: 38, color: '#8b6b7d' }).setOrigin(0.5);
      var totalAsked = this.registry.get('totalAsked') + 1;
      this.registry.set('totalAsked', totalAsked);

      var btnW = Math.min(140, (w - 60) / 2 - 20);
      var btnH = 48;
      var gap = Math.min(40, w - btnW * 2 - 40);
      var startX = w / 2 - (btnW * 2 + gap) / 2 + btnW / 2;
      var startY = 280;
      var self = this;
      options.forEach(function (val, i) {
        var col = i % 2;
        var row = Math.floor(i / 2);
        var x = startX + col * (btnW + gap);
        var y = startY + row * (btnH + 20);
        var btn = self.add.rectangle(x, y, btnW, btnH, 0xa8c5e0).setStrokeStyle(2, 0x5a7a9a).setInteractive({ useHandCursor: true });
        var lbl = self.add.text(x, y, String(val), { fontFamily: 'Arial', fontSize: 22, color: '#2d2a3a' }).setOrigin(0.5);
        btn.on('pointerdown', function () {
          self.answer(val, sum, prize);
        });
      });

      this.feedbackText = this.add.text(w / 2, 420, '', { fontFamily: 'Arial', fontSize: 16, color: '#2d2a3a' }).setOrigin(0.5);
    },
    answer: function (val, sum, prize) {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var correct = val === sum;
      if (correct) {
        var prizesWon = this.registry.get('prizesWon');
        prizesWon.push(prize.name);
        this.registry.set('prizesWon', prizesWon);
        var positions = this.registry.get('prizePositions');
        this.registry.set('prizePositions', positions.filter(function (p) { return p !== prize; }));
        var correctCount = this.registry.get('correctCount') + 1;
        this.registry.set('correctCount', correctCount);
        this.feedbackText.setText('Correct! You won: ' + prize.name + '!').setColor('#2d7a4a');
        var playerType = this.registry.get('playerType') || 'boy';
        var playerKey = 'player-' + playerType;
        var dancer;
        if (this.textures.exists(playerKey)) {
          dancer = this.add.sprite(w / 2, h - 140, playerKey).setScale(0.7);
        } else {
          dancer = this.add.text(w / 2, h - 140, playerType === 'boy' ? '👦' : '👧', { fontSize: 56 }).setOrigin(0.5);
        }
        var startY = dancer.y;
        this.tweens.add({
          targets: dancer,
          y: startY - 25,
          duration: 180,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut'
        });
        var fromScale = (dancer.scaleX != null) ? dancer.scaleX : 1;
        this.tweens.add({
          targets: dancer,
          scaleX: fromScale * 1.2,
          scaleY: fromScale * 1.2,
          duration: 200,
          yoyo: true,
          repeat: 3,
          ease: 'Sine.easeInOut',
          delay: 90
        });
        this.tweens.add({
          targets: dancer,
          angle: -14,
          duration: 140,
          yoyo: true,
          repeat: 5,
          ease: 'Sine.easeInOut',
          delay: 50
        });
      } else {
        this.feedbackText.setText('Not quite. The answer was ' + sum + '.').setColor('#b53d3d');
      }
      this.time.delayedCall(correct ? 1600 : 1400, function () {
        if (this.registry.get('correctCount') >= TARGET_CORRECT) {
          this.scene.start('WellDone');
        } else {
          this.scene.start('GameBoard');
        }
      }, [], this);
    }
  });

  var WellDoneScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
      Phaser.Scene.call(this, { key: 'WellDone' });
    },
    create: function () {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var character = this.registry.get('character');
      var correctCount = this.registry.get('correctCount');
      var totalAsked = this.registry.get('totalAsked');
      var prizesWon = this.registry.get('prizesWon') || [];

      this.add.rectangle(0, 0, w * 2, h * 2, 0xfef9f0).setOrigin(0);
      this.add.text(w / 2, 36, 'Math Party', { fontFamily: 'Georgia', fontSize: 30, color: '#8b6b7d' }).setOrigin(0.5);
      this.add.text(w / 2, 78, 'Well Done!', { fontFamily: 'Georgia', fontSize: 28, color: '#c9a227' }).setOrigin(0.5);
      this.add.text(w / 2, 118, 'You got ' + correctCount + ' out of ' + totalAsked + ' correct!', { fontFamily: 'Arial', fontSize: 17, color: '#8b6b7d' }).setOrigin(0.5);

      buildCharacterWithPrizes(this, w / 2, 260, character, prizesWon, 1.15);
      this.add.text(w / 2, 360, character.name, { fontFamily: 'Arial', fontSize: 16, color: '#8b6b7d' }).setOrigin(0.5);
      this.add.text(w / 2, 388, 'Prizes you won', { fontFamily: 'Arial', fontSize: 14, color: '#8b6b7d' }).setOrigin(0.5);
      var listCols = 2;
      var listY = 418;
      var listCellW = w / listCols;
      prizesWon.forEach(function (name, i) {
        var col = i % listCols;
        var row = Math.floor(i / listCols);
        var cellCenterX = (col + 0.5) * listCellW;
        var iconKey = 'icon-' + (getIconKey(name) || 'gift');
        if (!this.textures.exists(iconKey)) iconKey = 'icon-gift';
        this.add.sprite(cellCenterX - 52, listY + row * 36, iconKey).setScale(0.45);
        this.add.text(cellCenterX - 28, listY + row * 36, name, { fontFamily: 'Arial', fontSize: 11, color: '#2d2a3a' }).setOrigin(0, 0.5);
      }, this);

      var playAgainBg = this.add.rectangle(w / 2, h - 56, 180, 48, 0xc9a227).setOrigin(0.5).setInteractive({ useHandCursor: true });
      var playAgain = this.add.text(w / 2, h - 56, 'Play Again', { fontFamily: 'Arial', fontSize: 22, color: '#fff' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      playAgain.on('pointerdown', function () {
        this.registry.set('character', null);
        this.registry.set('playerType', null);
        this.registry.set('prizesWon', []);
        this.registry.set('correctCount', 0);
        this.registry.set('totalAsked', 0);
        this.registry.set('prizePositions', []);
        this.registry.set('playerRow', 0);
        this.registry.set('playerCol', 0);
        this.scene.start('CharacterSelect');
      }, this);
      this.children.bringToTop(playAgain);
      playAgainBg.on('pointerdown', function () {
        this.registry.set('character', null);
        this.registry.set('playerType', null);
        this.registry.set('prizesWon', []);
        this.registry.set('correctCount', 0);
        this.registry.set('totalAsked', 0);
        this.registry.set('prizePositions', []);
        this.registry.set('playerRow', 0);
        this.registry.set('playerCol', 0);
        this.scene.start('CharacterSelect');
      }, this);
    }
  });

  var config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    parent: 'game-container',
    backgroundColor: 0xfef9f0,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, CharacterSelectScene, GameBoardScene, MathProblemScene, WellDoneScene]
  };

  new Phaser.Game(config);
})();
