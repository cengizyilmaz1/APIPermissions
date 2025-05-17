# Microsoft API Permissions Explorer

A modern, responsive website for exploring and understanding Microsoft API permissions, focusing on Microsoft Graph API.

[![Deploy API Permissions Site](https://github.com/cengizyilmaz/apipermissions/actions/workflows/deploy.yml/badge.svg)](https://github.com/cengizyilmaz/apipermissions/actions/workflows/deploy.yml)

## Features

- 🔍 **Search & Filter**: Easily find specific permissions using advanced search and filtering options
- 📊 **Detailed Information**: Comprehensive details about each permission, including descriptions and scope
- 🔄 **Always Up-to-Date**: Automatically updates with the latest Microsoft Graph API permissions data
- 📱 **Responsive Design**: Optimized for all devices, from desktop to mobile
- 🌙 **Dark Mode Support**: Supports system dark mode preferences

## About

This website provides a user-friendly interface to explore and understand the various permissions available in Microsoft's API ecosystem, particularly in Microsoft Graph API. It's designed to help developers, administrators, and security professionals find the right permissions for their applications and understand the scope of each permission.

## Data Sources

All permission data on this site is sourced directly from the following Microsoft repositories:

- [permissions-descriptions.json](https://github.com/microsoftgraph/microsoft-graph-devx-content/blob/dev/permissions/permissions-descriptions.json) - Main permissions metadata
- [ProvisioningInfo.json](https://github.com/microsoftgraph/microsoft-graph-devx-content/blob/dev/permissions/new/ProvisioningInfo.json) - Information about permission provisioning
- [permissions.json](https://github.com/microsoftgraph/microsoft-graph-devx-content/blob/dev/permissions/new/permissions.json) - Additional permission details

The site automatically updates when changes are made to these sources, ensuring that the information is always current.

## Tech Stack

- HTML5 & CSS3
- JavaScript (ES6+)
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Alpine.js](https://alpinejs.dev/) - For interactive components
- GitHub Pages - For hosting
- GitHub Actions - For automated deployment and updates

## Development

### Project Structure

```
apipermissions-site/
├── about.html         # About page
├── data/              # Data directory for cached API permissions
├── index.html         # Main page
├── permissions.html   # Advanced permissions page
├── public/            # Public assets
│   ├── favicon.ico
│   └── logo.svg
└── src/               # Source code
    ├── app.js         # Main application code
    ├── advanced-filters.js # Advanced filtering functionality
    └── styles.css     # Custom styles
```

### Setup

1. Clone the repository
2. No build process is required - the site uses CDN-hosted libraries
3. Open `index.html` in your browser

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

This site is maintained by [Cengiz Yılmaz](https://cengizyilmaz.net).

For questions, feedback, or suggestions, please open an issue in this repository. 