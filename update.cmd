git pull
cd ..\pandemieende-updater
.\updater -a
cd ..\pandemieende
git add data.json
git commit -m ":chart_with_upwards_trend: Updating with new BAG data"
git push