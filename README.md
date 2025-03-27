<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ervette/pos">
    <img src="./frontend/public/icon.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">POS (Point of Sale) by Kiril Talalaiko</h3>

  <p align="center">
    A POS system that truly improves usability and experience! 
    <br />
    <a href="https://github.com/ervette/pos"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://youtu.be/oFdeyAqNz2s">View Demo</a>
    &middot;
    <a href="https://github.com/ervette/pos/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/ervette/pos/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

There are many POS systems available—both cloud-based and on-premises—but few have been subjected to the comprehensive and rigorous evaluation this project demands. That’s why this initiative was undertaken: to methodically assess and optimize cloud-based POS systems through a detailed comparative analysis with traditional on-premises solutions.

Key focus areas include:

* Performance & Scalability: Measuring system speed and capacity to adapt as business demands grow.
* Fault-Tolerance & Security: Ensuring systems are robust against failures and resistant to security threats.
* Advanced Technology Integration: Evaluating the contribution of machine learning and IoT in enhancing system functionality.

The primary objective is to rigorously document the advantages and limitations of each system type, guiding improvements in current POS solutions. The insights gained will support business operations by clarifying where each system excels and where vulnerabilities exist.

This work is intended for professionals seeking to elevate the reliability and efficiency of their POS systems through data-driven analysis and deliberate technological enhancements.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Bootstrap][Bootstrap.com]][Bootstrap-url]
* [![MongoDB][MongoDB]][Mongo-url]
* [![Node][Node.js]][Node-url]
* [![React][React.js]][React-url]
* [![Vite][Vite.js]][Vite-url]
* [![AWS][AWS]][AWS-url]


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

```sh
cd frontend; npm run dev;
```

```sh
cd backend; npm run dev;
```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ervette/pos
   ```
2. Install NPM packages
   ```sh
   npm install;
   ```
3. Enter your Mongo Atlas key in backend `.env`
   ```.env
   MONGO_URI = 'ENTER YOUR API';
   ```
4. Generate JWT SECRET and enter in backend `.env`
   ```.env
   JWT_SECRET = 'ENTER YOUR KEY';
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Access the application @ localhost:5173


<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Kiril Talalaiko - kiriltalalayko@gmail.com

Project Link: [here](https://github.com/ervette/pos)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ervette/pos.svg?style=for-the-badge
[contributors-url]: https://github.com/ervette/pos/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ervette/pos.svg?style=for-the-badge
[forks-url]: https://github.com/ervette/pos/network/members
[stars-shield]: https://img.shields.io/github/stars/ervette/pos.svg?style=for-the-badge
[stars-url]: https://github.com/ervette/pos/stargazers
[issues-shield]: https://img.shields.io/github/issues/ervette/pos.svg?style=for-the-badge
[issues-url]: https://github.com/ervette/pos/issues
[license-shield]: https://img.shields.io/github/license/ervette/pos.svg?style=for-the-badge
[license-url]: https://github.com/ervette/pos/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/kiril-talalaiko/
[product-screenshot]: frontend/public/icon.svg
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[Node.js]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Vite.js]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white
[Vite-url]: https://vite.dev
[MongoDB]: https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white
[Mongo-url]:https://www.mongodb.com
[AWS]: https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazonwebservices&logoColor=white
[AWS-url]: https://aws.amazon.com
