import { Blockfrost, Constr, Data, Lucid, SpendingValidator, TxHash, toHex, fromText, OutRef, Redeemer } from "lucid-cardano";
import { useWallet } from "@meshsdk/react";

// import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
// import * as cbor from "lucid-cardano"
import { LucidUtxo, NextPageWithLayout } from "@/models";
import { MainLayout } from "components/layout";
import { useState } from "react";
import { costLovelace } from "@/config/mint";
const recied = "addr_test1qzhgsynvfl8rg0w2e4ffyuqp09u57n75syp98hkwrz2pvu7xeufqpvn0vv4zgnc8knhp68h68ax4hfvdm5denk3mdzkq6ksrun"
const SC = "5901ee0100003232323232323232323232322223232533300a3232533300c002100114a06464660026eb0cc024c02ccc024c02c019200048040dd7198049805802240006002002444a66602600429404c8c94ccc040cdc78010018a5113330050050010033016003375c602800466e3cdd71980318040012400091010544656d6f2100149858cc028c94ccc028cdc3a400000226464a66602260260042930a99807249334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c6022002601000a2a660189212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e7400163008004004330093253330093370e900000089919299980818090010a4c2a6601a9201334c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2065787065637465640016375c6020002600e0062a660169212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016300700200233001001480008888cccc01ccdc38008018069199980280299b8000448008c03c0040080088c01cdd5000918029baa0015734ae6d5ce2ab9d5573caae7d5d0aba201"
// const lucid = await Lucid.new();
const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodqv6y5xg5lzEvw9ZSMNT3WNlLd96NRPa0"),
    "Preprod",
);

const LucidPage: NextPageWithLayout = () => {
    const [balance, setBalance] = useState<number>(0);
    const { wallet } = useWallet();

    const connectLucid = async () => {

        const api: any = await window.cardano.eternl.enable();
        console.log(api)
        console.log(lucid)
        lucid.selectWallet(api);
        const address = await lucid.wallet.address();
        const utxos = await lucid.wallet.getUtxos();
        let utxo: Array<LucidUtxo> = []
        let totalBalance = 0
        utxos.forEach((item: any) => {
            let lovelace = String(item.assets.lovelace);
            let lengthLovelace = lovelace.length
            totalBalance += Number(lovelace.substring(0, lengthLovelace - 1));

            console.log(lovelace)

        })
        setBalance(totalBalance);
        console.log("adress-------", recied)
        const tx = await lucid.newTx()
            .payToAddress(recied, { lovelace: 1000000n })
            .complete();

        const signedTx = await tx.sign().complete();

        const txHash = await signedTx.submit();
        console.log(txHash)
    }

    async function lock(
        lovelace: bigint,
        { into, owner }: { into: SpendingValidator; owner: string }
    ): Promise<TxHash> {
        const contractAddress = lucid.utils.validatorToAddress(into);

        const tx = await lucid
            .newTx()
            .payToContract(contractAddress, { inline: owner }, { lovelace })
            .complete();

        const signedTx = await tx.sign().complete();

        return signedTx.submit();
    }

    const handLock = async () => {
        const api: any = await window.cardano.eternl.enable();

        lucid.selectWallet(api);
        const utxos = await lucid.wallet.getUtxos();
        console.log("utxobefore: --", utxos)
        const validator: any = {
            type: "PlutusV2",
            script: SC,
        };

        const publicKeyHash: any = lucid.utils.getAddressDetails(
            await lucid.wallet.address()
        ).paymentCredential?.hash;
        console.log("validator: ", publicKeyHash)


        const datum = Data.to(new Constr(0, [publicKeyHash]));

        const txHash = await lock(3000000n, { into: validator, owner: datum });

        await lucid.awaitTx(txHash);

        console.log(`1 tADA locked into the contract at:
              Tx ID: ${txHash}
              Datum: ${datum}
          `);
    }
    async function unlock(
        ref: OutRef,
        { from, using }: { from: SpendingValidator; using: Redeemer }
    ): Promise<TxHash> {
        const [utxo] = await lucid.utxosByOutRef([ref]);
        console.log("utxo----", utxo)
    

        const tx = await lucid
            .newTx()
            .collectFrom([utxo], using)
            .addSigner(await lucid.wallet.address())
            .attachSpendingValidator(from)
            .complete();

        const signedTx = await tx
            .sign()
            .complete();

        return signedTx.submit();
    }

    const handUnLock = async () => {
       try {
        const api: any = await window.cardano.eternl.enable();

        lucid.selectWallet(api);
        const utxos = await lucid.wallet.getUtxos();
        console.log("utxobefore: --", utxos)
        const validator: any = {
            type: "PlutusV2",
            script: SC,
        };
        // const contractAddress = lucid.utils.validatorToAddress(validator);
        // console.log("address------", contractAddress)

        const utxo: OutRef = { txHash: "e09d65f8aae6b6ce3f575bc65d1e3fe7bdc23af5b2e9da2fd2f2749e219ad69c", outputIndex: 0 };

        const redeemer = Data.to(new Constr(0, [fromText("Demo!")]));

        const txHash = await unlock(utxo, {
            from: validator,
            using: redeemer,
        });

        await lucid.awaitTx(txHash);

        console.log(`1 tADA unlocked from the contract
                        Tx ID:    ${txHash}
                        Redeemer: ${redeemer}
                    `);
       } catch (error) {
        
       }

        
    }
  

    return (
        <>
            Page

            <button onClick={connectLucid}>Connect</button>
            <p>Total: {balance}</p>
            <button onClick={handLock}>Lock</button>
            <button onClick={handUnLock}>UnLock</button>
        </>

    );
}
LucidPage.Layout = MainLayout
export default LucidPage