// Copyright 2018 Google LLC.
// SPDX-License-Identifier: Apache-2.0

const { google } = require('googleapis');
const { query } = require('graphqurl')

const QUERY_GET_PRODUCTS = `
  query GetProductById ($idArray: [Int!]) {
    pr_products(where: {id: {_in: $idArray}}) {
      id
      name
    }
  }
`

exports.shipping = async (req, res) => {
  // define name of new sheet
  const SHEET_NAME = process.env.SHEET_NAME;
  const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
  const GRAPHQL_URL = process.env.GRAPHQL_URL;
  const GRAPHQL_TABLE = process.env.GRAPHQL_TABLE;
  const GRAPHQL_KEY = process.env.GRAPHQL_KEY;

  // block on auth + getting the sheets API object
  console.log("Getting Auth");
  const googleAuth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const auth = await googleAuth.getClient();
  const sheetsAPI = google.sheets({ version: 'v4', auth });
  const { event: {op, data}, table } = req.body;

  if ( op === 'INSERT' && table.name === GRAPHQL_TABLE && table.schema === 'public' ) {
    const { address1, address2, city, zipcode,
      date, total, id, product_ids } = data.new;

    // Get the product names
    const products = product_ids.split(',').map(function(val) {
		return parseInt(val, 10);
	});
    let variable = { idArray: products };
    let queryResponse = await query({
      query: QUERY_GET_PRODUCTS,
      endpoint: GRAPHQL_URL,
      headers: {
        'x-hasura-admin-secret': GRAPHQL_KEY
      },
      variable
    });
    responseProducts = queryResponse.data.pr_products.map(function(item) {
      return `* ${item.name}`;
    });
    let productManifest = responseProducts.join("\n");
    console.log(productManifest);

    // Append to sheet
    const appendResponse = await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:H1000`,
      valueInputOption: 'RAW',
      resource: {
        values: [
          [id, total, date, productManifest, address1, address2, city, zipcode]
        ]
      }
    });

    res.json({message: `${appendResponse.data.updates.updatedCells} cells appended`,
      error:false});
  } else res.json({error: false, message: 'Ignored event.'});
};
