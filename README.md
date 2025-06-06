# Poromet - Pore Size Analysis Tool

![Poromet Logo](public/poromet-logo.png)

An application for analyzing pore size distribution from SEM images. This tool helps researchers and material scientists to quickly analyze and visualize pore structures in various materials.

## Features

- Upload SEM images for analysis
- Adjust analysis parameters (magnification, max diameter, threshold)
- View analysis results including average and mode pore diameters
- Visualize pore size distribution with interactive histograms
- Download analysis results and images

## 特徴

- SEM画像のアップロードと解析
- 解析パラメータの調整（倍率、最大径、閾値など）
- 平均細孔径や最頻値などの解析結果の表示
- インタラクティブなヒストグラムによる細孔分布の可視化
- 解析結果や画像のダウンロード

## Prerequisites / 必要な環境

- Node.js (v14 or later)
- Python 3.8+
- npm or yarn

## Installation / インストール

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd Poromet-App
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up Python virtual environment and install dependencies:
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r backend/requirements.txt
   ```

## Usage / 使い方

1. Start the backend server:
   ```bash
   cd backend
   python server.py
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Upload an SEM image and adjust the analysis parameters as needed

5. Click "Run Analysis" to process the image

6. View and download the results from the interface

## Project Structure / プロジェクト構成

```
Poromet-App/
├── app/                    # Next.js frontend
│   ├── page.tsx            # Main page
│   └── ...
├── backend/                # FastAPI backend
│   ├── server.py           # Main server file
│   └── requirements.txt    # Python dependencies
├── public/                 # Static files
├── components/             # React components
└── ...
```

## License / ライセンス

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing / 貢献

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors / 作成者

- [Your Name] - Initial work

## Acknowledgments / 謝辞

- Built with Next.js, FastAPI, and other amazing open-source projects
