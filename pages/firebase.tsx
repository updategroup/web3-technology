import { database } from '../firebase/clientApp';

import { collection, QueryDocumentSnapshot, DocumentData, query, where, limit, getDocs } from "@firebase/firestore";


import { NextPageWithLayout } from "@/models";
import { MainLayout } from "components/layout";
import { useEffect, useState } from 'react';
import { doc } from '@firebase/firestore'; // for creating a pointer to our Document
import { setDoc } from 'firebase/firestore'; 


const FirebaseDB: NextPageWithLayout = () => {
    const cardanosCollection = collection(database, 'cardano');

    const [todos, setTodos] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
    const getCardano = async () => {
        // construct a query to get up to 10 undone todos 
        const todosQuery = query(cardanosCollection, where('done', '==', false), limit(10));
        // get the todos
        const querySnapshot = await getDocs(todosQuery);

        // map through todos adding them to an array
        const result: QueryDocumentSnapshot<DocumentData>[] = [];
        querySnapshot.forEach((snapshot) => {
            result.push(snapshot);
        });
        // set it to state
        setTodos(result);
    };

    useEffect(() => {
        // get the todos
        getCardano();
        // reset loading

    }, []);

    console.log("to---", todos)

    const addTodo = async () => {
        // get the current timestamp
        const timestamp: string = Date.now().toString();
        // create a pointer to our Document
        const _todo = doc(database, ``);
        // structure the todo data
        const todoData = {
          title,
          description,
          done: false
        };
        try {
          //add the Document
          await setDoc(_todo, todoData);
        } catch (error) {
          //show an error message
          
        }
     };

    return (
        <>

        </>

    );
}
FirebaseDB.Layout = MainLayout
export default FirebaseDB