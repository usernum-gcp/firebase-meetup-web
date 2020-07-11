'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Logging } = require('@google-cloud/logging');
const logging = new Logging({
  projectId: process.env.GCLOUD_PROJECT,
});

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://appdev-meetup-lab.firebaseio.com"
});


/** When a user is created, create a qwicklab token for them */
exports.addLabTokenOnAuth = functions.auth.user().onCreate(async(user) => {
  console.log('createTokenOnCallTransaction started')
  try {
    const user_id = user.uid;
    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.
    console.log('addLabTokenOnAuth started for user: %s, u_email: %s, uid: %s.', displayName, email, user_id)

    console.log('addLabTokenOnAuth: user ',user_id, 'token request')
    await admin.firestore().runTransaction(async(transaction) => {

      const usersRef = await admin.firestore().collection('attendees');
      const tokensRef = await admin.firestore()
          .collection('/labs/12-07-lab/qwicklab_tokens')
          .where("available", "==", true)
          .limit(1);

      // get next available token
      let tokenQ = await transaction.get(tokensRef);
      if (!tokenQ || tokenQ.size === 0)
      {
        console.log('addLabTokenOnAuth: no available tokens found')
        return;
      }


      const token_id = tokenQ.docs[0].data().token_id;
      const userDoc = await usersRef.doc(user_id);

      //update user record with assigned token
      await transaction.set(userDoc,
          {
            token_id: token_id,
            token_assigned: Date.now().toLocaleString(),
            email:email,
            displayName:displayName
          },{merge:true})
      console.log('addLabTokenOnAuth: user %s assigned %s on %s',user_id, token_id, Date.now().toLocaleString())
      //mark token as assigned
      await transaction.set(tokenQ.docs[0].ref,
          {available: false,
                assigned_on: Date.now().toLocaleString(),
                assigned_to: email}, {merge:true})
    })

  }catch (e) {
    console.log('addLabTokenOnAuth: something went wrong:', e)
  }
  console.log('addLabTokenOnAuth end')

  return;
});






/*
exports.createTokenOnCall = functions.https.onRequest(async (req, res) => {
  console.log('createToken start')
  try {
    const usersRef = admin.firestore().collection('attendees');
    const tokensRef = await admin.firestore().collection(
        '/labs/12-07-lab/qwicklab_tokens');
    let tokenQ = await tokensRef.where("available", "==", true).limit(1).get();
    if (tokenQ && tokenQ.size > 0) {
      usersRef.doc('3PRuql59WqeOX2Xn8bFHXixinEe2').update(
          {
            token_id: tokenQ.docs[0].data().token_id,
            token_assigned: Date.now()
          })
        console.log('done token: ', tokenQ.docs[0].data().token_id)
    }
  }
  catch (e) {
      console.log('something went wrong:', e)
    }
    console.log('createToken end')

    return res.sendStatus(200);
  });

exports.createTokenOnCallTransaction = functions.https.onRequest(async (req, res) => {
  console.log('createTokenOnCallTransaction start')
  try {
    ///TODO: REPLACE user_id by retrieving from the params
    const user_id = 'JwIBoAhLYuRggVexRVX4f7sKDHv1';
    console.log('createTokenOnCallTransaction: user ',user_id, 'token request')
    await admin.firestore().runTransaction(async(transaction) => {

      const usersRef = await admin.firestore().collection('attendees');
      const tokensRef = await admin.firestore()
          .collection('/labs/12-07-lab/qwicklab_tokens')
          .where("available", "==", true)
          .limit(1);

      // get next available token
      let tokenQ = await transaction.get(tokensRef);
      if (!tokenQ || tokenQ.size === 0)
      {
        console.log('no available tokens found')
        return res.sendStatus(200);
      }


      const token_id = tokenQ.docs[0].data().token_id;
      const userDoc = await usersRef.doc(user_id);

      //update user record with assigned token
      await transaction.update(userDoc,
          {
            token_id: token_id,
            token_assigned: Date.now()
          })
      console.log('createTokenOnCallTransaction: user %s assigned %s',user_id, token_id)
      //mark token as assigned
      await transaction.set(tokenQ.docs[0].ref,
          {available: false}, {merge:true})
    })

  }catch (e) {
    console.log('something went wrong:', e)
  }
  console.log('createToken end')

  return res.sendStatus(200);
});
*/

      /*const res = await tokenQ.docs[0].ref.set(
          {available: false},
          {merge: true})
      */
      /*
  admin.firestore().runTransaction(transaction => {
    const tokensRef = admin.firestore()
        .collection('/labs/12-07-lab/qwicklab_tokens')
        .where("available", "==", true)
        .limit(1);

    let tokenQ = transaction.get();
    const res = transaction.set(tokensRef,
        {available: false},
        {merge: true})

    const usersRef = admin.firestore().collection('attendees');

    //let tokenQ = tokensRef.where("available", "==", true).limit(1);

    if (tokenQ && tokenQ.size > 0) {
      let user_to_update = usersRef.doc('3PRuql59WqeOX2Xn8bFHXixinEe2')
      transaction.update(user_to_update,
          {
            token_id: tokenQ.docs[0].data().token_id,
            token_assigned: Date.now()
          }
      )

    else
      console.log('there are no available tokens left')

  /*if (tokenQ && tokenQ.size > 0) {
    console.log("tokenQ.size", '=>', tokenQ.size);
    console.log("first doc: ", tokenQ.docs[0].data());
    tokenQ.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  }*/




/*
    let available_token =  await tokensRootRef.doc('12-07-lab').collection().where("available", "==", true).limit(1).get()
    let token =  await tokensRef.limit(1).get()

    if (!available_token.exists) {
      console.log('No available_token !');
    } else {
      console.log('available_token data:', available_token.data());
    }

    if (!token.exists) {
      console.log('No token !');
    } else {
      console.log('token data:', token.data());
    }
*/
    //await tokensRef.doc('12-07-lab').where('token', '==', available_token['token']).limit(1).set('available', '==', true)

    //await usersRef.doc('user1').set({name: 'token'})
/*
  }
  catch (e) {
    console.log('something went wrong:', e)
  }
  console.log('createToken end')

  return res.sendStatus(200);
});
*/
  /*
exports.createTokenOnSignup = functions.auth.user().onCreate(async (user) => {
  const customer = { email: user.email };
  const intent =  { customer: customer.id};
  await admin.firestore().collection('labs/12-07-lab').doc(user.uid).get()
      {
    customer_id: customer.uid,
    setup_secret: intent.client_secret,
  });
  return;
});
*/

  /*
  await admin.firestore().collection('labs/12-07-lab').doc(user.uid).get()
  {
    customer_id: customer.uid,
        setup_secret: intent.client_secret,
  });*/

