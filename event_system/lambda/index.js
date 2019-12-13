// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

const { google } = require('googleapis');
const { query } = require('graphqurl');
// define name of new sheet
const sheetName = process.env.SHEET_NAME;
const spreadsheetId = process.env.SPREADSHEET_ID;
const spreadsheetKey = process.env.SPREADSHEET_KEY;
const graphqlUrl = process.env.GRAPHQL_URL;
const graphqlTable = process.env.GRAPHQL_TABLE;
const graphqlKey = process.env.GRAPHQL_KEY;

const queryGetProducts = `
  query GetProductById ($idArray: [Int!]) {
    pr_products(where: {id: {_in: $idArray}}) {
      id
      name
    }
  }
`

exports.handler = async (event) => {
  let response = {};
  try {
    // block on auth + getting the sheets API object
    const googleAuth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const auth = await googleAuth.getClient();
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    let { event: { op, data }, table: { name, schema }} = event;
    if ( op === 'INSERT' && name === graphqlTable && schema === 'public' ) {
      const { address1, address2, city, zipcode,
        date, total, id, product_ids } = data.new;

      // Get the product names
      const products = product_ids.split(',').map(function(val) {
    		return parseInt(val, 10);
    	});
      let variable = { idArray: products };
      // Query the products
      let queryResponse = await query({
        query: queryGetProducts,
        endpoint: graphqlUrl,
        variable
      });
      let responseProducts = queryResponse.data.pr_products.map(function(item) {
        return `* ${item.name}`;
      });
      let productManifest = responseProducts.join("\n");

      // Append to sheet
      console.log("Append to sheet")
      // console.log(sheetsAPI)
      const appendResponse = await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A2:H1000`,
        valueInputOption: 'RAW',
        resource: {
          values: [
            [id, total, date, productManifest, address1, address2, city, zipcode]
          ]
        }
      });

      response.body = JSON.stringify({message: `${appendResponse.data.updates.updatedCells} cells appended.`,
        error:false});
      response.statusCode = 200;
      console.log(response);
    } else response = {statusCode: 200, body: JSON.stringify({error: false, message: 'Ignored event.'})};
  } catch (e) {
    response = {
      statusCode: 400,
      body: {error: true, message: "Cannot parse hasura event.", trace: JSON.stringify(e)}
    };
  }

  console.log(response);
  return response;
};
