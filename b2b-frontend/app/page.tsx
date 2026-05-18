import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to the B2B Marketplace
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          Connect with trusted suppliers and buyers in one seamless platform.
        </p>
        <div className="mt-10 w-full max-w-md">
          <Image
            src="/marketplace-hero.png"
            alt="B2B Marketplace"
            width={800}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </div>
      </main>
    </div>
  );
}
