# Surge.sh Deployment

## Install Surge CLI
```bash
npm install -g surge
```

## Build and Deploy
```bash
npm run build
cd dist
surge --domain your-project-name.surge.sh
```

## Custom Domain (Optional)
```bash
surge --domain yourdomain.com
```