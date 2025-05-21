import axios from 'axios';
import config from '../config.mjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const randommerApiKey = config.development.randommerkey;
const outputDir = path.join(__dirname, 'pipeline_result');
const outputFile = path.join(outputDir, 'results.json');

async function fetchPetName() {
  try {
    const response = await axios.post("https://randommer.io/pet-names", 
      {
        animal: "Dog",
        number: 1
      },
      {
        headers: { 
          'X-Requested-With': "XMLHttpRequest",
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching Randommer pet name: ${error.message}`);
    return null;
  }
}

async function fetchFromRandommer(endpoint, params = {}) {
  try {
    const response = await axios.get(`https://randommer.io/api${endpoint}`, {
      headers: { 'X-Api-Key': randommerApiKey },
      params,
    });
    return response.data;
  } catch (error) {
    console.error(`Error Randommer (${endpoint})`);
    return null;
  }
}

async function fetchQuote() {
  try {
    // Using the Zenquotes API instead (no authentication required)
    const response = await axios.get('https://zenquotes.io/api/random');
    // Format to match the desired structure
    return {
      content: response.data[0].q,
      author: response.data[0].a
    };
  } catch (error) {
    console.error(`Error fetching quote: ${error.message}`);
    return null;
  }
}

async function fetchJoke() {
  try {
    const response = await axios.get('https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single');
    // Format to match the desired structure
    return {
      type: response.data.category,
      content: response.data.joke
    };
  } catch (error) {
    console.error(`Error fetching joke: ${error.message}`);
    return null;
  }
}

async function aggregateUserData() {
  const userProfile = {
    user: {

    },

  };

  try {
    // -------------------------------- partie randomuser --------------------------------
    const randomUserResponse = await axios.get('https://randomuser.me/api/');
    const randomUser = randomUserResponse.data.results[0];
    userProfile.user.name = `${randomUser.name.first} ${randomUser.name.last}`;
    userProfile.user.email = randomUser.email;
    userProfile.user.gender = randomUser.gender;
    userProfile.user.location = randomUser.location.city + ", " + randomUser.location.country;
    userProfile.user.picture = randomUser.picture.thumbnail;


  } catch (error) {
    console.error('Error Randomuser:', error.response?.data || error.message);
    userProfile.name = 'N/A (Randomuser failed)';
  }

  // -------------------------------- partie randommer --------------------------------
  const [
    phoneNumberData,
    ibanData,
    creditCardData,
    randomNameData,
    petnameData,
  ] = await Promise.all([
    fetchFromRandommer('/Phone/Generate', { CountryCode: 'US', Quantity: '1' }),
    fetchFromRandommer('/Finance/Iban/FR', {}),
    fetchFromRandommer('/Card', { type: 'Visa', quantity: '1' }),
    fetchFromRandommer('/Name', { nameType: 'fullname', quantity: '1' }),
    fetchPetName(),
  ]);

  userProfile.phoneNumber = phoneNumberData ? phoneNumberData[0] : 'N/A';
  userProfile.iban = ibanData ? ibanData : 'N/A';
  userProfile.creditCard = creditCardData ? creditCardData : 'N/A';
  userProfile.random_name = randomNameData ? randomNameData[0] : 'N/A';
  userProfile.pet_name = petnameData ? petnameData[0] : 'N/A';

  // -------------------------------- partie quote --------------------------------
  const quoteData = await fetchQuote();
  if (quoteData) {
    userProfile.quote = quoteData;
  } else {
    userProfile.quote = { content: 'N/A', author: 'N/A' };
  }
  
  // -------------------------------- partie joke --------------------------------
  const jokeData = await fetchJoke();
  if (jokeData) {
    userProfile.joke = jokeData;
  } else {
    userProfile.joke = { type: 'N/A', content: 'N/A' };
  }

  // -------------------------------- partie sauvegarde fichier --------------------------------
  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputFile, JSON.stringify(userProfile, null, 2));
    console.log(`Results saved to ${outputFile}`);
  } catch (error) {
    console.error('Error writing results to file:', error);
  }
}

aggregateUserData();