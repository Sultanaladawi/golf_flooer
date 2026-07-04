import os

directory = r"C:\Users\ECC\Documents\antigravity\dazzling-carson\src\admin\pages"
targets = [
    ("Embroidery", "Luxury"),
    ("EMBROIDERY", "LUXURY")
]

for filename in os.listdir(directory):
    if filename.endswith(".js") or filename.endswith(".jsx"):
        path = os.path.join(directory, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        modified = content
        # We want to replace "Zahrat Beesan Embroidery" or "Zahrat Beesan <span ...>Embroidery</span>"
        # Since it could have different formatting, let's target key occurrences
        # Let's replace the exact lines found by grep.
        # "Zahrat Beesan <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>" -> "Zahrat Beesan <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        # "Zahrat Beesan <span style={{ color: theme.text, fontStyle: 'italic' }}>Embroidery</span>" -> "Zahrat Beesan <span style={{ color: theme.text, fontStyle: 'italic' }}>Luxury</span>"
        # "Zahrat Beesan Embroidery" -> "Zahrat Beesan Luxury"
        # "Zahrat Beesan East Embroidery & Coutures" -> "Zahrat Beesan Luxury Abayas & Fashion"
        modified = modified.replace(
            "Zahrat Beesan <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>",
            "Zahrat Beesan <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        )
        modified = modified.replace(
            "Zahrat Beesan <span style={{ color: theme.text, fontStyle: 'italic' }}>Embroidery</span>",
            "Zahrat Beesan <span style={{ color: theme.text, fontStyle: 'italic' }}>Luxury</span>"
        )
        modified = modified.replace(
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>",
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        )
        modified = modified.replace(
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>",
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        )
        modified = modified.replace(
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>",
            "Zahrat Beesan <span style={{ color: 'var(--admin-accent)' }}>Zahrat Beesan</span> <span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        )
        # For general instances
        modified = modified.replace("Zahrat Beesan Embroidery", "Zahrat Beesan Luxury")
        modified = modified.replace("Zahrat Beesan East Embroidery & Coutures", "Zahrat Beesan Luxury Abayas & Fashion")
        modified = modified.replace("Zahrat Beesan East Embroidery", "Zahrat Beesan Luxury Abayas")
        
        # In Delivery.js:
        # "<span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>" -> "<span style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        modified = modified.replace(
            "style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Embroidery</span>",
            "style={{ color: 'var(--admin-text)', fontStyle: 'italic' }}>Luxury</span>"
        )
        
        if modified != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(modified)
            print(f"Updated {filename}")
