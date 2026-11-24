require('dotenv').config();

const whatsappService = require('../src/modules/whatsapp/whatsappService');
const { sequelize } = require('../src/models');

whatsappService.verifyConfiguration()
  .then((result) => {
    console.log(JSON.stringify({
      success: true,
      id: result.id,
      displayPhoneNumber: result.display_phone_number,
      verifiedName: result.verified_name,
    }, null, 2));
  })
  .catch((error) => {
    console.error(JSON.stringify({
      success: false,
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
    }));
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
