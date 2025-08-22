import { Suspense } from "react";
import "server-only";
import { EditPointForm } from "./editPointForm";


const NotChosen = () => {
    return (
        <div>
            <h3>No event or point chosen</h3>
            <p>Return to <a href="/events/">List all Events</a></p>
        </div>

    );
};
const updateAction = async (_formData: FormData) => {
    "use server";
    // Handle form submission
    return Promise.resolve();
};

const EditPage = async ({
    params,
}: {
    params: Promise<{ eventpoint: string[] }>,
}) => {
    const { eventpoint } = await params;
    const eventid = eventpoint[0] ? parseInt(eventpoint[0]) : 0;
    const pointid = eventpoint[1] ? parseInt(eventpoint[1]) : 0;
    // console.debug('params in edit event', params);

    if (eventid === 0 || pointid === 0) {
        return (
            <NotChosen />
        )
    }

    const slideshowJSON = {
        "eventid": 36,
        "pointid": 766,
        "slideshow": [
            {
                "eventid": 36,
                "pointid": 766,
                "image": "./images/36/766/2025-04-02 20.37.06.jpg",
                "caption": "one",
                "imageorder": 0
            },
            {
                "eventid": 36,
                "pointid": 766,
                "image": "./images/36/766/2025-04-02 19.57.03.jpg",
                "caption": "two",
                "imageorder": 1
            },
            {
                "eventid": 36,
                "pointid": 766,
                "image": "./images/36/766/2025-04-02 19.57.07.jpg",
                "caption": "three",
                "imageorder": 2
            },
            {
                "eventid": 36,
                "pointid": 766,
                "image": "./images/36/766/2025-04-02 19.57.12.jpg",
                "caption": "four",
                "imageorder": 3
            }
        ]
    };


    if (slideshowJSON === null || slideshowJSON === undefined) {
        return (
            <NotChosen />
        )
    }
    else {

        return (
            <Suspense fallback={<div>Loading Edit Information...</div>}>
                <EditPointForm evntSeqPntSlides={slideshowJSON} updateAction={updateAction} />
            </Suspense>
        )
    }
};
export default EditPage;
