"use client";

// Remove this line; use the browser's global File type instead.
import Form from 'next/form';
import Image from "next/image";
import { type Prettify } from "node_modules/zod/v4/core/util";
import { type ChangeEvent, useRef, useState } from "react";
// import { memo } from "react";

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

/*
interface HTMLInputElementFake extends Pick<HTMLInputElement, 'id' | 'name' | 'value' | 'files'> {
    addEventListener: (type: "click" | "change" | "input", listener: (evt: Event) => void | EventListenerObject, options?: boolean | AddEventListenerOptions) => void;
    id: string;
    name: string;
    value: string;
    files: FileList | null;
    click: () => void;
    current: HTMLInputElement | null;
}
*/

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



interface Props {
    evntSeqPntSlides: Prettify<Event_SeqPoints_Slideshow>,
    updateAction: (_formData: FormData) => void
}


export const EditPointForm = (
    {
        evntSeqPntSlides,
        updateAction
    }: Props
) => {




    const [deletedImages, setDeletedImages] = useState<string[]>([]);


    const slidesInputRef = useRef<HTMLInputElement[]>([]);
    const slidesInputArr = useRef<File[]>([]);
    const slidesImageRef = useRef<HTMLImageElement[]>([]);

    const [slides, setSlides] = useState<points_slideshow[]>(evntSeqPntSlides.slideshow);

    const deletedImagesRef = useRef<string[]>([]);

    //================= slides display ====================

    const passOnClick = (ref: React.RefObject<HTMLInputElement>) => {
        const input = ref.current;
        if (input) {
            input.click();
        }
    };

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
            // convert to url which Image can display by getting the actual file from the matching input element below
            const inputEl: HTMLInputElement = document.querySelector(`#slideInput_${_key}`)!; // as HTMLInputElement;
            const blob = new Blob(slidesInputArr.current[imageorder] ? [slidesInputArr.current[imageorder]] : [], { type: 'image/jpeg' });
            imageUrl = inputEl?.files?.[0] ? URL.createObjectURL(inputEl.files[0]) : URL.createObjectURL(blob);
        }

        // const fileName = slidesInputRef.current[index]?.files?.[0]?.name || 'ohno';
        // console.log(`SlideItem imageUrl: ${imageUrl} for slide ${imageorder} at index ${index}, fileName: ${fileName}`);
        return (
            (imageUrl === '' ||
                imageUrl === undefined ||
                imageUrl === null
            )
                ? null
                :
                <li id={`index-${index}`} key={`li-${_key}`} className="border border-gray-300 rounded-md p-2 m-2 flex items-start justify-start content-start">

                    <Image
                        className='cursor-pointer'
                        key={`slide-${_key}`}
                        id={`slide-${_key}`}
                        ref={el => {
                            if (el) {
                                slidesImageRef.current[imageorder] = el;
                            }
                        }}
                        src={imageUrl}
                        alt={`Slide ${imageorder} for point ${pointid}`}
                        width={200}
                        height={150}
                        onClick={() => {
                            // if (slidesInputRef && slidesInputRef!.current && Array.isArray(slidesInputRef!.current) && slidesInputRef!.current[imageorder]) {
                            passOnClick(slidesInputRef.current[imageorder] as unknown as React.RefObject<HTMLInputElement>);
                            // }
                        }} //`slideInput_${_key}`
                    />
                    <div className="block ml-2" key={`div-${_key}`}>
                        <Caption text={caption ?? ''} />
                        <button type="button" onClick={() => confirm('Are you sure you want to delete this slide?') ? removeSlide({ pointid: pointid, image: image }) : null} className="align-text-bottom bg-amber-300 text-red-700 p-2 rounded hover:bg-amber-600 transition duration-200 mb-1">
                            Remove X
                        </button>
                        <SlideFileInput keyName={_key} imageorder={imageorder} />
                    </div>
                </li>
        );

    }

    // const SlideFileInput = memo(({ keyName, index }: { keyName: string; index: number }) => {
    const SlideFileInput = ({ keyName, imageorder }: { keyName: string; imageorder: number }) => {
        // console.log(`Rendering SlideFileInput for keyName: ${keyName}, index: ${index}`);
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
                        console.log(`File input changed for slide ${imageorder}:`, e.target.files);
                        handleFilePickSlides(e, imageorder);
                    }
                }
                accept="image/png, image/jpeg, image/gif"
                className="mb-1 hidden"
            />
        );
    };
    // }, (prevProps, nextProps) => {
    //     // Only re-render if keyName or index has changed
    //     return prevProps.keyName === nextProps.keyName && prevProps.index === nextProps.index;
    // });

    const Caption = ({ text }: { text: string }) => {
        // const Caption = memo(({ text }: { text: string }) => {
        console.log(`Rendering Caption for text: ${text}`);
        return (
            <textarea cols={50}
                name='captions[]'
                defaultValue={text}
                className="block mb-2" />
        );
    }
    // }, (prevProps, nextProps) => {
    //     // Only re-render if text has changed
    //     return prevProps.text === nextProps.text;
    // });


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
                        return (
                            <SlideItem
                                key={_key}
                                pointid={slide.pointid}
                                image={slide.image}
                                caption={slide.caption}
                                imageorder={slide.imageorder}
                                index={index}
                            // key={`slide-${index}`}
                            />
                        );
                    })}
                </ol>
                : null
        );
        return content;
    };

    const handleSubmit = (formData: FormData) => {
        if (Array.isArray(slidesInputArr.current) && slidesInputArr.current.length > 0) {
            slidesInputArr.current.forEach((file, index) => {
                console.log(`Adding slide file ${index}:`, file);
                formData.append(`slideFile[]`, file);
            });
            formData.set('eventid', evntSeqPntSlides?.eventid.toString());
            formData.set('pointid', evntSeqPntSlides?.pointid.toString());
            formData.set('deletedImages[]', JSON.stringify(deletedImages));
            formData.set('slides', JSON.stringify(slides));

            // const blob = new Blob(slidesInputArr.current, { type: 'image/jpeg' });
            // formData.append('slidesRefArr', blob);
        }
        updateAction(formData);
    };


    return (
        // <Form action={updateAction} id="editPointForm">
        <Form action={handleSubmit} id='editpPointForm'>
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
        </Form>
    )
};
