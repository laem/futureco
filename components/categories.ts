import baseCategories from '@/app/categories.yaml'
import moreCategories from '@/app/moreCategories.yaml'
const categories = [...baseCategories, ...moreCategories]

export const getCategory = (searchParams) => {
	const categoryName = searchParams.cat,
		category = categoryName && categories.find((c) => c.name === categoryName)

	return category
}
