# Zecit Bridge

**Zecit Bridge** is a privacy-preserving application designed to bridge **Zcash (ZEC)** to **Solana (SOL)**. It leverages the **SimpleSwap API** for exchange functionality and integrates **MetaMask Snaps** for direct Zcash transaction signing, ensuring a seamless and private user experience.

![Zecit Bridge Banner](public/window.svg)

## 🚀 Features

- **Privacy-First Bridging:** Move assets from Zcash (Shielded) to Solana (SPL) anonymously.
- **Zcash Snap Integration:** Connect MetaMask to manage Zcash assets and sign transactions directly within the app.
- **Solana Wallet Support:** Full support for Phantom, Solflare, and other Solana wallets via `@solana/wallet-adapter`.
- **Real-Time Quotes:** Fetch live exchange rates and minimum amounts via SimpleSwap.
- **Responsive Design:** Fully optimized for Mobile, Tablet, and Desktop devices.
- **Modern UI/UX:** Built with a sleek, dark-themed interface using Tailwind CSS and Framer Motion animations.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Wallets:**
  - **Solana:** `@solana/wallet-adapter-react`
  - **Zcash:** Custom `useZcashSnap` hook (integrating `@chainsafe/webzjs-zcash-snap`)
- **API:** SimpleSwap (for bridging), CoinMarketCap (for price feeds)

## 📦 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/YUST777/bridge.git
    cd bridge
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**

    Copy the example environment file and update it with your API keys:

    ```bash
    cp .env.example .env.local
    ```

    Open `.env.local` and add your keys:

    ```env
    # SimpleSwap API Key (Required for bridging)
    SIMPLESWAP_API_KEY=your_simpleswap_api_key_here

    # CoinMarketCap API Key (Optional, for price data)
    CMC_API_KEY=your_coinmarketcap_api_key_here

    # Solana RPC URL (Optional)
    NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Support

The application is fully responsive. On mobile devices:
- **Navigation:** Uses a bottom navigation bar for easy access to Bridge, Analytics, History, and Settings.
- **Menu:** A hamburger menu provides access to wallet connection and app launch options on the landing page.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
