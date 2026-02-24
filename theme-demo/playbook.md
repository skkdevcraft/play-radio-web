# Convert .mov files into animated gifs

```sh
for f in *.mov; do
  ffmpeg -i "$f" -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" palette.png
  ffmpeg -i "$f" -i palette.png -filter_complex "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse" "${f%.mov}.gif"
  rm palette.png
done
```