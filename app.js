const apiKey = '81c14de2-6891-461b-9ea6-3ed218675b8f';

// on init, pull all dealer options
// add read view
// add edit view
// add delete function
// add create view

// beforeCreate > created > mounted > (beforeUpdate  + updated) .... unmount
// has my data changed? if so, rerender the change on my template

const app = Vue.createApp({
	// initialized the component
	// data bound to the template
	data() {
		return {
			allDealerOptions: null,
			allDealerOptionsTotal: 0,
			filteredDealerOptions: null,
			selectedOption: null,
			alteredOption: {},
			createOption: {},
			filterInput: '',
			editMode: false,
			page: 0,
			take: 15,
		};
	},
	// runs when the component is ready
	created: async function () {
		await this.getAllDealerOptions();
	},
	beforeUpdate: function () {
		this.filterOptions(this.filterInput);
	},
	// funcitons to do things and can be called from the html using @{functionName}
	methods: {
		selectOption(dotId, optionId) {
			const foundOption = this.allDealerOptions.find(
				(x) => x.dotDigitalId === dotId && x.rooftopGoogleOptionId === optionId
			);
			Object.assign(this.alteredOption, foundOption);
			return (this.selectedOption = foundOption);
		},
		async getAllDealerOptions(skip = false) {
			if (skip) {
				this.allDealerOptionsTotal = this.allDealerOptions.length;
				this.filteredDealerOptions = this.allDealerOptions
					.map((e) => e)
					.splice(this.page * this.take, this.take);
				this.$forceUpdate();
				return;
			}

			const res = await fetch(
				`https://services.metricsamsi.com/v1.0/dealers/options?apiKey=${apiKey}`
			);
			if (res.ok) {
				this.allDealerOptions = (await res.json()).data.sort(function (a, b) {
					return a.dotDigitalId - b.dotDigitalId;
				});
				this.allDealerOptionsTotal = this.allDealerOptions.length;
				this.filteredDealerOptions = this.allDealerOptions
					.map((e) => e)
					.splice(this.page * this.take, this.take);
				this.$forceUpdate();
			} else {
				console.error(res);
				alert('something went wrong');
			}
		},
		getDealerOptions(dotId, optionId) {
			this.editMode = false;
			this.selectOption(dotId, optionId);
		},
		// z
		editDealerOption(dotId, optionId) {
			this.editMode = true;
			this.selectOption(dotId, optionId);
			// copy by value, not by reference
		},
		async updateDealerOption(id) {
			// make api call and pass this.alteredOption
			// build the petch to update the option
			const result = await fetch(
				`https://services.metricsamsi.com/v1.0/dealers/options/${id}?apiKey=${apiKey}`,
				{
					body: JSON.stringify({
						optionName: this.alteredOption.optionName,
						optionValue: this.alteredOption.optionValue,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'PATCH',
				}
			);

			// reload the stored option with the altered option
			if (result.ok) {
				await this.reloadCloseModal();
			} else {
				console.error(result);
				alert('something went wrong');
			}
		},
		async createDealerOptions() {
			// add a create button, open new modal with that button
			// on create button click, post to create api
			const result = await fetch(
				`https://services.metricsamsi.com/v1.0/dealers/options?apiKey=${apiKey}`,
				{
					body: JSON.stringify({
						optionName: this.createOption.optionName,
						optionValue: this.createOption.optionValue,
						platformName: 'string',
						dotDigitalId: 2,
						googleId: 2,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
					method: 'POST',
				}
			);
			// handle response (reloadCloseModal)
			if (result.ok) {
				await this.reloadCloseModal();
			} else {
				console.error(result);
				alert('something went wrong');
			}
		},
		async deleteDealerOptions(id) {
			var deleteConfirmed = confirm(
				`Are you sure you want to delete this record id: ${id}?`
			);
			// make api call and pass this.alteredOption
			// build the petch to update the option
			if (deleteConfirmed) {
				const result = await fetch(
					`https://services.metricsamsi.com/v1.0/dealers/options/${id}?apiKey=${apiKey}`,
					{
						method: 'DELETE',
					}
				);

				if (result.ok) {
					await this.reloadCloseModal();
				} else {
					console.error(result);
					alert('something went wrong');
				}
			}
		},
		// z
		filterOptions: function (key) {
			if (key) {
				if (this.page > Math.ceil(this.allDealerOptionsTotal / this.take))
					this.page = 0;
				this.filteredDealerOptions = this.allDealerOptions.filter(
					(c) =>
						c.optionName.toLowerCase().includes(key.toLowerCase()) ||
						c.dotDigitalAccount?.accountName
							.toLowerCase()
							.includes(key.toLowerCase()) ||
						c.optionValue?.toLowerCase().includes(key.toLowerCase()) ||
						c.dotDigitalId?.toString().toLowerCase().includes(key.toLowerCase()) ||
						c.rooftopGoogleOptionId?.toString().toLowerCase().includes(key.toLowerCase())
				);
				this.allDealerOptionsTotal = this.filteredDealerOptions.length;
				this.filteredDealerOptions = this.filteredDealerOptions
					.map((e) => e)
					.splice(this.page * this.take, this.take);
			} else {
				this.allDealerOptionsTotal = this.allDealerOptions.length;
			}
		},
		reloadCloseModal: async function () {
			await this.getAllDealerOptions();
			document.getElementById('closeModal').click();
			document.getElementById('closeCreateModal').click();
		},
		toggleEditMode: function () {
			this.editMode = !this.editMode;
		},
		setPage: async function (number) {
			this.page = number;
			await this.getAllDealerOptions(true);
		},
		next: async function () {
			if (this.page == Math.ceil(this.allDealerOptionsTotal / this.take) - 1) {
			} else {
				this.page += 1;
				await this.getAllDealerOptions(true);
			}
		},
		previous: async function () {
			if (this.page == 0) {
			} else {
				this.page -= 1;
				await this.getAllDealerOptions(true);
			}
		},
	},
});

app.mount('#app');
