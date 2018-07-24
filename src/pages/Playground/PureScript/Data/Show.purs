module Data.Show
  ( class Show, show
  ) where

class Show a where
  show :: a -> String
