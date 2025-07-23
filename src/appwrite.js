import {Client, Databases, ID, Query} from 'appwrite';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// console.log(PROJECT_ID,DATABASE_ID,COLLECTION_ID);
const client = new Client()
.setEndpoint('https://cloud.appwrite.io/v1')
.setProject(PROJECT_ID)
const database = new Databases(client);
export const updateSearchCount = async (searchterm, movie) => {
    // use appwrite sdk to check if the search term exists in the database
    try {
        const results = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchterm',searchterm),
        ])

        if(results.documents.length > 0) {
            const doc = results.documents[0];

            await database.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id, {
                count: doc.count + 1,
            })
        } else {
            await database.createDocument(DATABASE_ID,COLLECTION_ID, ID.unique(), {
                searchterm,
                count:1,
                movie_id:movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch (error) {
        
    }
}

export const getTrendingMovies = async () => {
    try {
        const results = await database.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc("count")
        ])
        return results.documents;
    } catch (error) {
        
    }
}