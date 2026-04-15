const axios = require('axios');

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_NUMBER_ID;

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message
        }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);
  }
}

async function sendWhatsAppImages(to, ruta) {
  const images = await getImages(ruta);

  //await sendWhatsAppMessage(to, `📸 Promociones de ${ruta}:`);

  for (const img of images.slice(0, 5)) {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          link: img.url
        }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    await new Promise(r => setTimeout(r, 600));
  }
}

async function getImages(ruta) {
  const { data } = await axios.get(
    `https://www.asesoria-web.com.mx/public/promociones/listar_imagenes.php?ruta=${ruta}`
  );

  return data;
}

module.exports = { sendWhatsAppMessage,
									 sendWhatsAppImages	};