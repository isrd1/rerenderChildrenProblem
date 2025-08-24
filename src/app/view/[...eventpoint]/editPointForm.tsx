"use client";

// Remove this line; use the browser's global File type instead.
import Form from 'next/form';
import Image from "next/image";
import { type Prettify } from "node_modules/zod/v4/core/util";
import React, { type ChangeEvent, startTransition, useActionState, useRef, useState } from "react";
import { updateAction } from './serverAction';

function removeDot(path: string): string {
    if (path.startsWith('./')) {
        return path.slice(1); // Remove the leading dot
    }
    return path;
}

type points_slideshow = {
    image: string;
    pointid: number;
    caption: string | null;
    imageorder: number;
}

type Event_SeqPoints_Slideshow = ({
    slideshow: {
        image: string;
        pointid: number;
        caption: string | null;
        imageorder: number;
    }[];
} & {
    eventid: number;
    pointid: number;
})

type DelSlide = Pick<points_slideshow, 'pointid' | 'image'>;

function getLastFiveCharsWithoutExtension(filename: string): string {
    // Find the index of the last dot
    const lastDotIndex = filename.lastIndexOf('.');
    // If no dot is found, the entire string is treated as the filename
    const baseName = lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
    const pattern = /[/\\.\s]/g; // Escaped characters: \, /, and .
    const newName = baseName.replace(pattern, ''); // remove leading slash if present
    // Return the last 5 characters of the base name, or the entire base name if it's shorter
    return newName.slice(-5);
}

const initialState = { message: '', title: '' };

interface Props {
    evntSeqPntSlides: Prettify<Event_SeqPoints_Slideshow>,
}

export const EditPointForm = (
    {
        evntSeqPntSlides
    }: Props
) => {

    // const handleSubmit = (initialState: any, formData: FormData) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (Array.isArray(slidesInputArr.current) && slidesInputArr.current.length > 0) {
            slidesInputArr.current.forEach((file, index) => {
                console.log(`Adding slide file ${index}:`, file);
                formData.append(`slideFile[]`, file);
            });
        }
        if (Array.isArray(slidesInputArr.current) && slidesInputArr.current.length > 0) {
            slidesInputArr.current.forEach((file, index) => {
                console.log(`Adding slide file ${index}:`, file);
                formData.append(`slideFile[]`, file);
            });
        }
        formData.set('eventid', evntSeqPntSlides?.eventid.toString());
        formData.set('pointid', evntSeqPntSlides?.pointid.toString());
        formData.set('deletedImages[]', JSON.stringify(deletedImages));
        formData.set('slides', JSON.stringify(slides));

        startTransition(() => {
            // updateAction(initialState, formData);
            submitAction(formData);
        });
    };


    const [state, submitAction] = useActionState(
        updateAction,
        initialState,
    );

    const [deletedImages, setDeletedImages] = useState<string[]>([]);
    const [slides, setSlides] = useState<points_slideshow[]>(evntSeqPntSlides.slideshow);
    const [captions, setCaptions] = useState<string[]>(evntSeqPntSlides.slideshow.map(slide => slide.caption ?? ''));

    const deletedImagesRef = useRef<string[]>([]);
    const slidesInputRef = useRef<HTMLInputElement[]>([]);
    const slidesInputArr = useRef<File[]>([]);
    const slidesImageRef = useRef<HTMLImageElement[]>([]);

    //================= slides display ====================

    const removeSlide = (delSlide: Pick<points_slideshow, 'pointid' | 'image'>) => {
        const delslide: DelSlide = {
            pointid: delSlide.pointid,
            image: delSlide.image,
        }
        setDeletedImages(deletedImages => [
            ...deletedImages,
            JSON.stringify({ image: delslide.image })
        ]);
        // remove the slide from the slides state
        setSlides(slides.filter((slide) => slide.image !== delSlide.image));
    };


    const handleFilePickSlides = (e: ChangeEvent<HTMLInputElement>, imageorder: number) => {
        const file = e.target.files?.[0];
        console.log("file in handleFilePickSlides: ", file);

        if (file && file.size > 0) {
            if (!(file.name.lastIndexOf('blob', 0) === 0)) { // this happens if you've changed the image and then changed it again.  The original image stored will start with '/images/...'
                if (slides[imageorder] !== undefined) {
                    const previousFileName = slides[imageorder]?.image;
                    // mark the previous slide image for deletion in the action
                    setDeletedImages(deletedImages => [
                        ...deletedImages,
                        JSON.stringify({ image: previousFileName })
                    ]);
                    deletedImagesRef.current.push(previousFileName);
                    slidesInputArr.current[imageorder] = file;
                    if (slidesImageRef.current[imageorder]) {
                        slidesImageRef.current[imageorder].src = URL.createObjectURL(file);
                    }

                    // update image name, leave the other properties unchanged and but don't mutate the slides array
                    setSlides(slides.map((slide) => {
                        if (imageorder === slide.imageorder) {
                            return { ...slide, image: file.name };
                        }
                        // No changes
                        return slide;
                    }));
                }
            }
        }
    };

    const SlideItem = (
        { pointid, image, caption, imageorder, index }:
            { pointid: number, image: string, caption: string | null, imageorder: number, index: number }) => {

        const endOfImageName = getLastFiveCharsWithoutExtension(image);
        const _key = `${pointid}_${imageorder}_${endOfImageName}`;
        let imageUrl = removeDot(image);
        if (!imageUrl.includes('/')) { // no path so just filename
            // no path to file so create url from input to display in Image
            const inputEl: HTMLInputElement = document.querySelector(`#slideInput_${_key}`)!; // as HTMLInputElement;
            const blob = new Blob(slidesInputArr.current[imageorder] ? [slidesInputArr.current[imageorder]] : [], { type: 'image/jpeg' });
            imageUrl = inputEl?.files?.[0] ? URL.createObjectURL(inputEl.files[0]) : URL.createObjectURL(blob);
        }

        // const fileName = slidesInputRef.current[index]?.files?.[0]?.name || '';
        // console.log(`SlideItem imageUrl: ${imageUrl} for slide ${imageorder} at index ${index}, fileName: ${fileName}`);
        return (
            (imageUrl === '' ||
                imageUrl === undefined ||
                imageUrl === null
            )
                ? null
                :
                <li id={`index-${index}`} key={`li-${_key}`} className="border border-gray-300 rounded-md p-2 m-2 flex items-start justify-start content-start relative">

                    <Image
                        className='cursor-pointer'
                        key={`slide-${_key}`}
                        id={`slide-${_key}`}
                        ref={el => {
                            if (el) {
                                slidesImageRef.current[imageorder] = el;
                            }
                        }}
                        // src={imageUrl}
                        src={slidesImageRef.current[imageorder]?.src ?? imageUrl}
                        alt={`Slide ${imageorder} for point ${pointid}`}
                        width={200}
                        height={150}
                    // onClick={() => {
                    // not used now, I make the file input fill the space but be transparent so it takes the click itself rather than this image passing the click on
                    //     const ref = slidesInputRef.current[imageorder];
                    //     if (ref) {
                    //         ref.click();
                    //     }
                    // }}
                    />
                    <div className="block ml-2 mb-0 pb-0" key={`div-${_key}`}>
                        <Caption text={caption ?? ''} imageorder={imageorder} />
                        <button type="button" onClick={() => confirm('Are you sure you want to delete this slide?') ? removeSlide({ pointid: pointid, image: image }) : null}
                            className="cursor-pointer align-text-bottom bg-amber-300 text-red-700 p-2 rounded hover:bg-amber-600 hover:text-amber-100 transition duration-200 mb-0">
                            Remove X
                        </button>
                        <SlideFileInput
                            keyName={_key}
                            imageorder={imageorder}
                            matchingSlide={slidesImageRef.current[imageorder]}
                        />
                    </div>
                </li>
        );

    }

    const SlideFileInput = ({ keyName, imageorder, matchingSlide }: { keyName: string; imageorder: number; matchingSlide?: HTMLImageElement }) => {
        return (
            <input
                key={keyName}
                type="file"
                id={`slideInput_${keyName}`}
                name='slideFile[]'
                ref={el => {
                    if (el) {
                        slidesInputRef.current[imageorder] = el;
                    }
                }}
                onChange={
                    (e) => {
                        console.log(`onChange File input changed for slide ${imageorder}:`, e.target.files);
                        console.log(`matchingSlide:`, matchingSlide);
                        handleFilePickSlides(e, imageorder);
                        // const newFileURL = URL.createObjectURL(e.target.files?.[0] || new Blob());
                        // if (matchingSlide) {
                        //     matchingSlide.src = newFileURL;
                        // }
                    }
                }
                accept="image/png, image/jpeg, image/gif"
                className="absolute top-1.5 left-1.5 z-0 cursor-pointer"
                style={{ height: '150px', width: '200px', opacity: 0, color: 'transparent' }} // Hide the input but keep it accessible
                title='click to pick a different file'
            />
        );
    };

    const Caption = ({ text, imageorder }: { text: string; imageorder: number }) => {
        console.log(`Rendering Caption for text: ${text}`);
        return (
            <textarea cols={50} rows={4}
                name='captions[]'
                aria-placeholder='Enter caption for this slide'
                defaultValue={text}
                // if I use onChange to make a managed component then focus is lost after every character typed
                // if I leave it uncontrolled every time the component re-renders, whenever a file is edited
                // then the comment returns to the default value
                // so I have to use a ref to store the current value and onBlur to update the state which is when
                // the user finishes editing
                ref={el => {
                    if (el) {
                        el.value = captions[imageorder] ?? '';
                    }
                }}
                onBlur={(e) => {
                    const newCaptions = [...captions];
                    newCaptions[imageorder] = e.target.value;
                    setCaptions(newCaptions);
                }}
                placeholder="Enter caption for this slide"
                className="block mb-3.25" />
        );
    }


    //================= end slides display ================

    const SlidesDisplay = ({ pntSlides }: {
        pntSlides: points_slideshow[]
    }) => {
        console.log("Rendering slides SlidesDisplay");
        const content = (
            (pntSlides.length > 0) ?
                <ol id="slideshowList">
                    {pntSlides.map((slide, index) => {
                        const endOfImageName = getLastFiveCharsWithoutExtension(slide.image);
                        const _key = `${slide.pointid}_${slide.imageorder}_${endOfImageName}_${slide.caption?.substring(0, 6)}`;
                        const caption = captions[slide.imageorder] ?? slide.caption ?? '';
                        return (
                            <SlideItem
                                key={_key}
                                pointid={slide.pointid}
                                image={slide.image}
                                caption={caption}
                                imageorder={slide.imageorder}
                                index={index}
                            />
                        );
                    })}
                </ol>
                : null
        );
        return content;
    };



    return (
        <Form onSubmit={handleSubmit} id='editpPointForm' action={''}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="col-span-full">
                            <label className="block text-sm/6 font-bold text-gray-900">Slideshow photos
                                <div className="mt-2 flex">
                                    <div>
                                        <SlidesDisplay pntSlides={slides} />
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button type="button" className="text-sm/6 font-semibold text-gray-900">Cancel</button>
                <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
            </div>
            {/* Display the echoed form data */}
            {state.message ? (
                <div aria-live="polite" style={{ marginTop: '1rem' }}>
                    <h2 className="text-lg font-bold">{state.title}</h2>
                    <div dangerouslySetInnerHTML={{ __html: state.message }} />
                </div>
            ) : null}
        </Form>
    )
};
