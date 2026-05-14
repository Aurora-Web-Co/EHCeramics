module.exports = {
  name: "EH Ceramics",
  email: "email@example.com",
  phoneForTel: "",
  phoneFormatted: "",
  address: {
    lineOne: "",
    lineTwo: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    mapLink: "",
  },
  socials: {
    facebook: "",
    instagram: "",
  },
  //! Include the file protocol (https://) and NO trailing slash
  domain: "https://www.example.com",
  isProduction: process.env.ELEVENTY_ENV === "PROD",
};
