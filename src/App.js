import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartDataLabels
);

export const App = (props) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('')

  const debouncedSetSearch = _.debounce((value) => setSearch(value), 50);
  
  useEffect(() => {

    const url = 'https://restcountries.com/v3.1/all';

    const fetchData = async() => {
      setLoading(true);
      try {
        const {data: response} = await axios.get(url);
        setData(response);
        setLoading(false);
      } catch (error) {
        console.error(error.message);
      }
    }

    fetchData();
  }, []);

  // Filtering the data with search bar input
  const filteredData = data.filter((country) => {

    // Handling missing langauges and capitals info and converting all of them to strings 
    country.languages = country.languages == null || undefined ?  "Not Found" : country.languages;
    country.capital = country.capital == null || undefined ?  "Not Found" : country.capital;
    if (Array.isArray(country.capital)) {
      country.capital = country.capital.join('')
    }
    const languagesString = Object.keys(country.languages).map((key) => country.languages[key]).join(", ");
    
    // Filtering the data using the search state
    return (
      country.name.common.toLowerCase().includes(search.toLowerCase()) ||
      country.capital.toLowerCase().includes(search.toLowerCase()) ||
      languagesString.toLowerCase().includes(search.toLowerCase()) 

  )})

  // Mapping all countries in the API and returning all of them in separate panels
  const allCountries = filteredData.map(
    ({name, capital, region, population, languages, flags, currencies}) => {

    // Error handling missing info
    capital = capital == null ? "Not Found" : capital;
    region = region == null ? "Not Found" : region;
    population = population == null ? "Not Found" : population;
    languages = languages == null ? "Not Found" : languages;
    flags = flags == null ? "Not Found" : flags;
    currencies = currencies == null ? "Not Found" : currencies;
  

    // Converting languages to a string
    const languagesString = Object.keys(languages).map((key) => languages[key]).join(", ");

    // Converting currencies to a string
    const currenciesString = Object.keys(currencies).map((key) => currencies[key].name).join(", ");

    // Rendering panels of all countries
      return (
        <div className='countryPanel'>
        <ul>
          <div className='flagContainer'>
            <img src={flags.svg} alt="flag" className='flag'/>
          </div>
          <li><p className='countryName'>{name.common}</p></li>
          <li><p>Capital:</p> {capital}</li>
          <li><p>{Object.keys(languages).length > 1 ? `Languages:` : `Language:`}</p> {languagesString}</li>
          <li><p>Population:</p> {population.toLocaleString('en-US')}</li>
          <li><p>{Object.keys(currencies).length > 1 ? `Currencies:` : `Currency:`}</p> {currenciesString}</li>
        </ul>
      </div>
      )
    })

    // Creating a bar chart of the 10 most populated countries in the world and top 10 most spoken languages
    const PopulationGraph = React.memo(props => {
      if (data.length > 0) {
        const population = data.map((country) => ({name: country.name.common, population: country.population,}));
    
        // Calculate world population
        let worldPopulation = 0
        for (let i = 0; i < population.length; i++) {
          worldPopulation += population[i].population
        }
    
        // Sort the population number in ascending order
        const populationSort = population.sort((a, b) => b.population - a.population);
    
        // Iterate through population and get 10 of the highest populated countries
        let topCountries = [
          {
            name: 'World',
            population: worldPopulation,
          },
        ];

        for (let i = 0; i < 10; i++) {
          topCountries.push(populationSort[i]);
        };
        
        // Setting up the bar chart data and options
        const chartData = {
          labels: topCountries.map(({ name }) => name),   // setting the labels to be a name of a country
          datasets: [
            {
              label: "Population",
              data: topCountries.map(({ population }) => population),   // setting the data to be a population of a country
              fill: false,
              backgroundColor: '#05386B',
              borderWidth: 1,
              borderColor: '#777',
              hoverBorderWidth: 1,
              hoverBorderColor: '#000',
              borderRadius: 7,

            },
          ]
        };

        // Defining the options for the chart
        const chartOptions = {
            locale: 'en-US',
            indexAxis: 'y',
            layout: {
              padding: {
                  right: 150,
              }
          },
            scales: {
              x: {
                grid: {
                  display: false
                },
                display: false,
              },
              y: {
                grid: {
                  display: false
                }
              }
            },
            responsive: true,
            plugins: {
              datalabels: {
                color: 'black',
                anchor: 'end',
                align: 'end',
                clamp: true,
                formatter: (value, ctx) => {
                  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
              }
            },
          };
 
          return (
          <div className='graphContainer'>
            <a href='#home'><span class="material-symbols-outlined" style={{fontSize:36, color: '#005555'}}>home</span></a>
            <h2>Top 10 most populated countries in the world</h2>
            <Bar
              data={chartData}
              options={chartOptions}
            />
          </div>
        );
      }
      return null;
    });

  return (
    <>
      <header>
        <div className='header' id='home'>
          <h1>World Countries Data</h1>
          <p>Currently, there are {data.length} countries in total.</p>
        </div>
      </header>
      <main>
        <section className='search'>
        <div className='navBar'>
          <input
            type='text'
            placeholder='Search by country, capital or language...'
            onChange={e => debouncedSetSearch(e.target.value)}
            className='searchBar'
            />
            <a href='#graphs'><span className="material-symbols-outlined" style={{fontSize:36, color: '#005555'}}>bar_chart</span></a>
        </div>

        </section>
        <section className='countries'>
          <div className='countriesContainer'>
            {loading && <h3>Loading...</h3>}
            {allCountries}
          </div>
        </section>
        <section className='graphs' id='graphs'>
            <PopulationGraph />
        </section>
      </main>
      <footer>
          <small>Patryk Puhacz, 2023</small>
      </footer>
    </>
  )
}