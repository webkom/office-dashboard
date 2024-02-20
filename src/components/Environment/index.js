import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-refetch';
import { withStyles, withTheme } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import { faThermometerHalf } from '@fortawesome/free-solid-svg-icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faSkull } from '@fortawesome/free-solid-svg-icons';
import { faIndustry } from '@fortawesome/free-solid-svg-icons';
import { ENVIRONMENT_URL, OFFICE_SENSORS } from 'app/config';
import Measurement from 'app/components/Environment/Measurement';
import LoadingIcon from 'app/components/LoadingIcon';

import Table from 'app/components/Table';
import TableHeader from 'app/components/Table/Header';
import TableBody from 'app/components/Table/Body';
import TableColumn from 'app/components/Table/Column';

const styles = theme => ({
  rightAlign: {
    textAlign: 'right'
  },
  loading: {
    color: theme.palette.secondary.dark
  }
});

export class Environment extends Component {
  state = {
    isLoading: true,
    lastDatetime: null,
    sensors: null,
    environment: null
  };

  componentDidUpdate(prevProps) {
    const { apiFetch } = this.props;
    const { isLoading, lastDatetime, sensors } = this.state;

    if (!isLoading && apiFetch.pending) {
      this.setState({ isLoading: true });
    } else if (isLoading && apiFetch.rejected) {
      // throw apiFetch.reason.message;
    } else if (apiFetch.fulfilled) {
      const response = apiFetch.value;

      // Only use the sensors in the office
      const officeSensors = Object.keys(response.sensors)
        .filter(key => OFFICE_SENSORS.includes(key))
        .reduce((obj, key) => {
          obj[key] = response.sensors[key];
          return obj;
        }, {});

      // Sum all the values
      const environment = Object.values(officeSensors).reduce(
        (prev, cur) => ({
          TVOC: prev.TVOC + cur.TVOC,
          eCO2: prev.eCO2 + cur.eCO2,
          humidity: prev.humidity + cur.humidity,
          pressure: prev.pressure + cur.pressure,
          temperature: prev.temperature + cur.temperature
        }),
        {
          TVOC: 0,
          eCO2: 0,
          humidity: 0,
          pressure: 0,
          temperature: 0
        }
      );

      // Get the average value of each measurement
      Object.keys(environment).forEach(key => {
        environment[key] =
          Math.round(
            (environment[key] / Object.keys(officeSensors).length) * 100
          ) / 100;
      });

      if (
        JSON.stringify(sensors) !== JSON.stringify(response.sensors) ||
        lastDatetime !== response.last_datetime
      ) {
        const newState = {
          isLoading: false,
          lastDatetime: response.last_datetime,
          sensors: response.sensors,
          environment
        };
        this.setState(newState);
      }
    }
  }
  render() {
    const { width } = this.props;
    const { isLoading, environment } = this.state;
    const isLarge = width !== undefined && ['lg', 'xl'].includes(width);
    const maxItems = 4;
    const valueHeight = 100 / maxItems;

    return (
      <Table>
        <TableHeader height={valueHeight}>
          <span>Sensorer</span>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <Grid item container justify={'center'} alignItems={'center'}>
              <LoadingIcon size={4} />
            </Grid>
          ) : (
            <TableColumn>
              <Measurement
                icon={faThermometerHalf}
                value={`${environment.temperature} °C`}
                alt="Temperatur"
                name={isLarge ? 'Temperatur' : 'Temp..'}
              />
              <Measurement
                icon={faCloud}
                value={`${environment.humidity} %`}
                alt="Luftfuktighet"
                name={isLarge ? 'Fuktighet' : 'Fukt..'}
              />
              <Measurement
                icon={faSkull}
                value={`${environment.TVOC} ppb`}
                alt="TVOC (Total Volatile Organic Compound) concentration parts per billion (ppb)"
                name={'TVOC'}
              />
              <Measurement
                icon={faIndustry}
                value={`${environment.eCO2} ppm`}
                alt="eCO2 (equivalent calculated carbon-dioxide) concentration parts per million (ppm)"
                name={'CO2'}
              />
            </TableColumn>
          )}
        </TableBody>
      </Table>
    );
  }
}

Environment.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired,
  apiFetch: PropTypes.object.isRequired
};

export default withWidth()(
  withTheme()(
    withStyles(styles)(
      connect(props => ({
        apiFetch: {
          method: 'GET',
          mode: 'cors',
          url: ENVIRONMENT_URL,
          refreshInterval: 5000
        }
      }))(Environment)
    )
  )
);
