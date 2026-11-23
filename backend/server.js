// pokreće server; odvojeno od app.js da testovi mogu uvesti app bez pokretanja servera
import app from './app.js' // složena app: middleware i rute 
import { config } from './config.js' // port 


app.listen(config.port, () => {
    // Pokreće server da sluša zahtjeve na odabranom portu
    console.log(`Working on ${config.port}`)
    // Ispisuje poruku u konzolu da server radi
})
