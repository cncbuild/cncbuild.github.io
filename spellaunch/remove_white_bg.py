"""Remove white/light background from PNG images (make those pixels transparent)."""
from PIL import Image

def remove_light_bg(path, color_threshold=235, brightness_threshold=240):
    """Make pixels transparent if they're white/light gray (by color and brightness)."""
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    data = list(img.getdata())
    new_data = []
    for item in data:
        r, g, b, a = item
        brightness = (r + g + b) / 3
        # Transparent if: nearly white (all channels high) OR very bright (catches off-white/gray)
        is_bg = (r >= color_threshold and g >= color_threshold and b >= color_threshold) or brightness >= brightness_threshold
        if is_bg:
            new_data.append((r, g, b, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"Processed: {path}")

if __name__ == "__main__":
    remove_light_bg("mothership.png")
    remove_light_bg("spaceship.png")
    remove_light_bg("gallaga.png")
    remove_light_bg("millennium-falcon.png")
    remove_light_bg("optimus-prime.png")
