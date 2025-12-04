-- Migration 017: Update book covers with images from BigCartel

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/412478760/Bissai+2+plat+1.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'face-b-lamour-revele-nos-identites';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/412338321/couverture_histoire_foot_africain_page-0001.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'histoire-football-africain';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/412076082/Rai+1ere+de+couv.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'les-buts-de-ma-vie';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/404019750/Paris+noir+-+couv+plat+1+bandeau.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'paris-noir';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/401630910/Couv+avec+bandeau_HD.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'si-tu-savais';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/393500448/bissai+couv+plat+1.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'face-b-1';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/391224111/Dudes-Plat-1.jpeg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'les-dudes';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/389636796/BAKHAW-cover.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'libere';

UPDATE books SET cover_image_url = 'https://assets.bigcartel.com/product_images/382478898/A+bras+le+corps+-+couv+HD.jpg?auto=format&fit=max&h=1200&w=1200'
WHERE slug = 'a-bras-le-corps';
