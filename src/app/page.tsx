import Link from "next/link";

export default async function Home() {

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            {/* <div className="container flex flex-row items-center justify-center gap-12 px-4 py-16"> */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-[5rem]">
                My Problem &amp; My Scenario
            </h1>
            {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"> */}
            <Link
                // className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                className="flex max-w-4xl mt-3 flex-col gap-4 rounded-xl bg-white/30 p-4 hover:bg-white/20"
                href="/view/event/36"
            >
                <h3 className="text-2xl font-bold">
                    View Demo →
                </h3>
                <div className="text-lg">
                    <h4 className="font-bold  text-blue-950">my Problem</h4>
                    <p className="font-light">I show the slides/images together with a caption and hidden input type=&quot;file&quot;.  But any change I make to one
                        causes them all to be re-rendered thus overwriting any changes made previously.  I&apos;ve tried de-aggregating
                        the objects in state, I&apos;ve tried making sure each component of each object has a separate unique key, but
                        I&apos;m not getting anywhere.
                    </p>
                    <h4 className="font-bold  text-blue-950">The Scenario</h4>
                    <p className="font-light">
                        I have a list of images, each with a caption and a file input (which is hidden ).
                        The number of images can be from zero to, let&apos;s say about 10, but as yet, there&apos;s no limit.
                        The images are loaded from a database but in this demo I&apos;ve used some hardcoded values.  These images are in
                        a state variable.  When I retrieve the images I also get an id, the image, a caption, and the ordering for
                        each image.  These are in this object, which actually what&apos;s stored in state, and therefore is perhaps
                        the source of my problem.  This is the structure of the object, named points_slideshow:
                    </p>
                </div>
            </Link>
            <pre>{`
                        type points_slideshow = {
                            image: string;
                            pointid: number;
                            caption: string | null;
                            imageorder: number;
                        };
                        `}
            </pre>
            {/* </div> */}
            {/* </div> */}
        </main>
    );
}
