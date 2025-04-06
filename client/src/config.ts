// Configuration for the application
// Override environment variables or provide fallbacks here

export const config = {
  // Use your production Stripe public key here
  stripePublicKey: 'pk_live_51OKZB6LFvQVKTGdj4zBwqrPMiAU48dRRfGfHwWCvhzO3lVgAM3m5YVSQlMVYbfugrFNUt3tROF3yF2Vx9TJ3yFNu00FuJPPyVd',
  
  // Stripe checkout links
  stripeCheckoutLinks: {
    free: 'https://buy.stripe.com/14kg135UDeK05iweUW',
    basic: 'https://buy.stripe.com/cN23eh5UD0Tah1e7st',
    pro: 'https://buy.stripe.com/aEU1692IrdFWdP25kk'
  }
};