

import { NextPageWithLayout } from "@/models";
import { MainLayout } from "components/layout";
import { usePolybase, useCollection } from "@polybase/react";



const PolybaseDB: NextPageWithLayout = () => {
    const db = usePolybase();


    const collectionReference = db.collection("City");

    async function createRecord() {
        // .create(args) args array is defined by the constructor fn
        const recordData = await collectionReference.create([
            "new-york",
            "New York",
            db.collection("Person").record("johnbmahone")
        ]);

        const { data, error, loading } =
            useCollection<any>(db.collection("users"));
        console.log(data)
    }


    return (
        <>
            <h1>Data</h1>
            <button onClick={createRecord}>Create</button>
            <button ></button>
        </>

    );
}
PolybaseDB.Layout = MainLayout
export default PolybaseDB