import { Sprite, Assets } from 'pixi.js';

// Test function to verify how Sprite.from works in PixiJS v8
async function testSpriteFrom() {
  console.log("Testing Sprite.from in PixiJS v8");
  
  try {
    // Method 1: Direct usage
    const sprite1 = Sprite.from('https://pixijs.com/assets/bunny.png');
    console.log("Sprite created with Sprite.from:", sprite1);
    
    // Method 2: Load first
    await Assets.load('https://pixijs.com/assets/bunny.png');
    const sprite2 = Sprite.from('https://pixijs.com/assets/bunny.png');
    console.log("Sprite created after Assets.load:", sprite2);
  } catch (e) {
    console.error("Error in test:", e);
  }
}

testSpriteFrom();
