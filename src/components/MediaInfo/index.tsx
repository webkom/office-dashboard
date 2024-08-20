import React, { ReactEventHandler, useEffect, useState } from "react";
// import PropTypes from "prop-types";
import Color from "color";
import ColorThief from "colorthief/dist/color-thief.mjs";
// import { connect } from "react-refetch";
// import { withStyles, withTheme } from "@material-ui/core/styles";
// import withWidth from "@material-ui/core/withWidth";
// import Grid from "@material-ui/core/Grid";
// import Zoom from "@material-ui/core/Zoom";
// import { OFFICE_CHROMECAST_URL } from "app/config";
// import lightLogo from 'app/static/abakus_logo_black_webkom.png';
// import Data from "app/components/MediaInfo/Data";
import "./index.css";

const MediaInfo = () => {
  const [mediaColors, setMediaColors] = useState({
    backgroundColor: "",
    textColor: "",
    imageShadowColor: "",
    progressBarColor: "",
    progressBarBackgroundColor: "",
  });

  const [showMedia, setShowMedia] = useState(false);

  useEffect(() => {
    setShowMedia(true);
  }, []);

  const updateMediaColors = (imageElement: HTMLImageElement) => {
    const colorThief = new ColorThief();

    const paletteRGBs = colorThief.getPalette(imageElement) as number[][];

    if (!paletteRGBs.length) {
      return;
    }

    const [firstColor, ...otherColors] = paletteRGBs.map((RGB) =>
      Color.rgb(RGB),
    );

    // Set base colors
    let backgroundColor = "";
    let textColor = "";

    if (firstColor.isLight()) {
      backgroundColor = firstColor.darken(0.5).hsl().string();
    } else {
      backgroundColor = firstColor.darken(0.5).hsl().string();
    }

    const contrastColors = otherColors.filter(
      (color) => color.isLight() !== firstColor.isLight(),
    );

    if (contrastColors.length) {
      textColor = contrastColors[0].hsl().string();
    } else {
      textColor = "#FFF";
    }

    // Infer final colors based on base colors
    const imageShadowColor = Color(textColor).darken(0.2).hsl().string();
    const progressBarColor = Color(textColor).fade(0.3).hsl().string();
    const progressBarBackgroundColor = Color(textColor)
      .fade(0.8)
      .hsl()
      .string();

    setMediaColors({
      backgroundColor,
      textColor,
      imageShadowColor,
      progressBarColor,
      progressBarBackgroundColor,
    });
  };

  const handleImageLoad: ReactEventHandler<HTMLImageElement> = (e) => {
    updateMediaColors(e.currentTarget);
  };

  type ProgressBarProps = {
    progress: number;
    backgroundColor: React.CSSProperties["backgroundColor"];
    progressColor: React.CSSProperties["backgroundColor"];
  };

  const ProgressBar = ({
    progress,
    backgroundColor,
    progressColor,
  }: ProgressBarProps) => (
    <div
      className={`progress-bar-background`}
      style={{ backgroundColor: backgroundColor }}
    >
      <div
        className="progress-bar-line"
        style={{ width: `${progress * 100}%`, backgroundColor: progressColor }}
      />
    </div>
  );

  const progress = 0.2;

  return (
    <div
      className="media-wrapper g-width-full"
      style={{
        backgroundColor: mediaColors.backgroundColor,
        transform: showMedia ? "scale(1)" : "",
      }}
    >
      <div className="media-content g-flex-row g-flex-justify-center">
        <a href="" className="media-image-link g-flex-row">
          <img
            onLoad={handleImageLoad}
            className="media-image"
            src="abakule.png"
          />
        </a>
        <div
          className="media-meta g-flex g-flex-col"
          style={{ color: mediaColors.textColor }}
        >
          <div className="media-title-and-artist">Eg er fet - Pellepingu</div>
          <div className="media-album">Kult album</div>
          <div className="media-progress g-flex-row g-flex-align-end g-height-full">
            <div className="g-flex-row g-width-full g-flex-align-center">
              <div className="progress-start">08:00</div>
              <ProgressBar
                backgroundColor={mediaColors.progressBarBackgroundColor}
                progressColor={mediaColors.progressBarColor}
                progress={progress}
              />
              <div className="progress-end">12:25</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaInfo;
