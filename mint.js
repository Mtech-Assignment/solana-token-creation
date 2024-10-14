import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeMetadataPointerInstruction,
    getTokenMetadata,
    TYPE_SIZE,
    LENGTH_SIZE,
  } from "@solana/spl-token";
  import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    pack,
  } from "@solana/spl-token-metadata";

  import { getKeypairFromFile } from "@solana-developers/helpers";
   
  // Playground wallet
  const payer = await getKeypairFromFile("C:/Users/I528640/.config/solana/id.json");
const mint = Keypair.generate();
const metadata = {
    mint: mint.publicKey,
    name: "CSDP",
    symbol: "CSDP",
    uri: "https://raw.githubusercontent.com/Mtech-Assignment/CSDP-image/refs/heads/main/Screenshot%202024-10-11%20141910.png?token=GHSAT0AAAAAACV6JDNPC4V6VXG5IPDZBQHOZYNQDDA",
    additionalMetadata: [
        ["key", "value"]
    ]
}
const mintSpace = getMintLen([
    ExtensionType.MetadataPointer
]);
const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const lamports = await connection.getMinimumBalanceForRentExemption(
    mintSpace + metadataSpace
)
const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: mintSpace,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID
})

const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
    mint.publicKey,
    payer.publicKey,
    mint.publicKey,
    TOKEN_2022_PROGRAM_ID
)

const initializeMintIx = createInitializeMintInstruction(
    mint.publicKey,
    2,
    payer.publicKey,
    null,
    TOKEN_2022_PROGRAM_ID
)
const initializeMetadataIx = createInitializeInstruction({
    mint: mint.publicKey,
    metadata: mint.publicKey,
    mintAuthority: payer.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: payer.publicKey
})

const updateMetadataField = createUpdateFieldInstruction({
    metadata: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: payer.publicKey,
    field: metadata.additionalMetadata[0][0],
    value: metadata.additionalMetadata[0][1],
})

  // Connection to devnet cluster
   
  // Transaction to send
  let transaction = new Transaction().add(
    createAccountIx,
    initializeMetadataPointerIx,
    initializeMintIx,
    initializeMetadataIx,
    updateMetadataField
  );
  // Transaction signature returned from sent transaction
  const sig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mint]
  );

  console.log("sig ", sig);
  const chainMetadata = await getTokenMetadata(
    connection,
    mint.publicKey
  )

  console.log(chainMetadata)