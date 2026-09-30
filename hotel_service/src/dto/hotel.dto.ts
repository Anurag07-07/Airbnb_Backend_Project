export type createHotelDTO = {
  name:string;
  address:string;
  location:string;
  rating:number;
  ratingCount:number
}

export type updateHotelDTO = {
  name?:string
  address?:string
  location?:string
  rating?:number
  ratingCount?:number
}