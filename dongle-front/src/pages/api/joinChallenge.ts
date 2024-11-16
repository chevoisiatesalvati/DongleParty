// joinChallenge
import admin from '@/config/firebase-admin'

import { withAuth } from "@/middlewares/middleware";

async function joinChallengeHandler(req: any, res: any) {
    console.log('--> joinChallengeHandler');

    
  try {
    const challengeId = req?.body?.challengeId
    const uid = req?.uid

    let challenge = (await admin.database().ref(`challenges/lists/${challengeId}`).once('value')).val()
    console.log('🔑🔑🔑 getChallengesHandler', {challenge});
    
    if(!challenge) throw "Challenge not found"
    // Check if user already addedd! 
    const userAlreadyAdded = challenge?.participants?.[uid]
    if(userAlreadyAdded) return res.status(200).json(challenge)
    
    const userRecord = await admin.auth().getUser(uid);
    console.log('🔑🔑🔑 getChallengesHandler - userRecord', userRecord);
    
    // const email = userRecord.email;
    const twitterProvider = userRecord.providerData.find( (provider) => provider.providerId === 'twitter.com' );
    const twitterHandler = twitterProvider?.displayName || null;
    console.log('🔑🔑🔑 twitterHandler - twitterHandler', twitterHandler);

    const wallet = (await admin.database().ref(`wallets/user_id/${uid}`).once('value')).val()
    if(!wallet) throw "wallet not found"
    const wallet_address = wallet?.wallet?.default_address_id

    const result = await admin.database().ref(`challenges/lists/${challengeId}/participants/${uid}`).set({
        uid,
        joinedAt: Date.now(),
        wallet_address,
        twitterHandler
    })

    let challengeReuslt = (await admin.database().ref(`challenges/lists/${challengeId}`).once('value')).val()
    
    return res.status(200).json(challengeReuslt);
  } catch (error) {
    console.error('Error in get Challenges Handler:', error);
    return res.status(500).json({ error });
  }
}

export default withAuth(joinChallengeHandler)