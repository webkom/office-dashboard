import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Color from 'color';
import ColorThief from 'color-thief';
import { connect } from 'react-refetch';
import { withStyles, withTheme } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import Zoom from '@material-ui/core/Zoom';
import { OFFICE_CHROMECAST_URL } from 'app/config';
// import lightLogo from 'app/static/abakus_logo_black_webkom.png';
import Data from 'app/components/MediaInfo/Data';

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  grow: {
    flexGrow: 1
  },
  toolbar: {
    justifyContent: 'center',
    flex: '1 1 auto',
    textAlign: 'center',
    padding: 20,
    fontSize: '1rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem'
    }
  },
  leftAlign: {
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  loading: {
    color: theme.palette.secondary.dark
  },
  logo: {
    height: '50px'
  },
  webkom: {
    height: '60px'
  },
  clock: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  clockDay: {
    textTransform: 'capitalize',
    fontSize: '1rem'
  },
  clockTime: {
    fontFamily: 'monospace',
    fontSize: '3rem'
  },
  mediaContainer: {
    padding: '10px 0',
    backgroundColor: theme.palette.secondary.darkest,
    boxShadow: 'rgba(16, 23, 27, 0.52) 0px 0px 13px 3px inset',
    transition: 'all 1s ease-in'
  },
  githubContainer: {
    display: 'flex',
    height: '100%'
  }
});

export class MediaInfo extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    chromecast: null,
    mediaImage: null
  };

  componentDidUpdate(prevProps) {
    const { apiFetch } = this.props;
    const { isLoading, chromecast, mediaImage } = this.state;

    if (!isLoading && apiFetch.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && apiFetch.rejected) {
      // throw apiFetch.reason.message;
    } else if (apiFetch.fulfilled) {
      const response = apiFetch.value;

      const chromecastStatus = response.current_status;

      if (JSON.stringify(chromecast) !== JSON.stringify(chromecastStatus)) {
        const newState = {
          isLoading: false,
          lastDatetime: response.last_datetime,
          chromecast: chromecastStatus
        };
        if (
          newState.chromecast &&
          newState.chromecast.image !== null &&
          (mediaImage === null || mediaImage.src !== newState.chromecast.image)
        ) {
          // Get the most dominant color of the media image
          const updatedMediaImage = new Image(300, 300);
          updatedMediaImage.crossOrigin = 'Anonymous';
          updatedMediaImage.src = newState.chromecast.image;

          const _ = this;
          updatedMediaImage.onload = function() {
            const colorThief = new ColorThief();
            const mediaColor = Color.rgb(
              colorThief.getColor(updatedMediaImage)
            );
            const backgroundColor = mediaColor.isLight()
              ? mediaColor.darken(0.5)
              : mediaColor;
            updatedMediaImage.setAttribute(
              'backgroundColor',
              backgroundColor.hsl().string()
            );
            const mediaPalette = colorThief.getPalette(updatedMediaImage);
            const mediaTextColors = mediaPalette
              .map(rgbArray => Color.rgb(rgbArray))
              .filter(color => color.isLight() !== backgroundColor.isLight());
            updatedMediaImage.setAttribute(
              'textColor',
              mediaTextColors.length > 0
                ? mediaTextColors[0].hsl().string()
                : '#FFFFFF'
            );
            newState.mediaImage = updatedMediaImage;
            _.setState(newState);
          };
        } else {
          this.setState(newState);
        }
      }
    }
  }

  render() {
    const { classes, width, theme } = this.props;
    const { chromecast, mediaImage, isLoading } = this.state;
    const isMobile = width !== undefined && width === 'xs';

    const mediaColor =
      mediaImage !== null
        ? mediaImage.getAttribute('backgroundColor')
        : theme.palette.secondary.darkest;
    const mediaTextColor =
      mediaImage !== null ? mediaImage.getAttribute('textColor') : '#FFFFFF';

    if (isLoading) return (<div></div>)

    return (
      <div>
        {chromecast &&
          chromecast.artist !== null &&
          chromecast.state !== 'UNKNOWN' && (
            <Zoom in>
              <div>
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  className={classes.mediaContainer}
                  style={{ backgroundColor: mediaColor }}
                >
                  <Grid item xs={isMobile ? 11 : 5}>
                    <Data
                      content={chromecast}
                      backgroundColor={mediaColor}
                      textColor={mediaTextColor}
                    />
                  </Grid>
                </Grid>
              </div>
            </Zoom>
          )}
      </div>
    );
  }
}

MediaInfo.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  apiFetch: PropTypes.object.isRequired
};

export default withWidth()(
  withTheme()(
    withStyles(styles)(
      connect(props => ({
        apiFetch: {
          method: 'GET',
          mode: 'cors',
          url: OFFICE_CHROMECAST_URL,
          refreshInterval: 5000,
        }
      }))(MediaInfo)
    )
  )
);
